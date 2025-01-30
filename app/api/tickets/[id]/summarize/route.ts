import { type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { loadSummarizationChain } from "langchain/chains"
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { Document } from "langchain/document"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params (Next.js 15 style)
    const { id } = await params
    console.log('🎫 Attempting to summarize ticket:', { id })

    // Create admin client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get ticket data
    console.log('📝 Fetching ticket data from requests table...')
    const { data: ticket, error: ticketError } = await supabase
      .from("requests")
      .select("title, description")
      .eq("id", id)
      .single()

    if (ticketError) {
      console.error('❌ Error fetching ticket:', ticketError)
      return Response.json(
        { error: "Failed to fetch ticket", details: ticketError.message },
        { status: 404 }
      )
    }

    if (!ticket) {
      console.error('❌ No ticket found with ID:', id)
      return Response.json(
        { error: "Ticket not found", id },
        { status: 404 }
      )
    }

    // Get messages for this ticket
    console.log('💬 Fetching messages for ticket...', { id })
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", id)
      .order('created_at', { ascending: true })
    
    console.log('📊 Messages query result:', {
      error: messagesError,
      count: messages?.length,
      firstMessage: messages?.[0],
      requestId: id
    })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      return Response.json(
        { error: "Failed to fetch messages", details: messagesError.message },
        { status: 500 }
      )
    }

    console.log('✅ Successfully fetched ticket and messages:', { 
      title: ticket.title,
      hasDescription: !!ticket.description,
      messageCount: messages?.length ?? 0
    })

    // Prepare text for summarization
    const textToSummarize = `
      Title: ${ticket.title}
      Description: ${ticket.description}
      
      Messages:
      ${messages?.map(msg => `- ${msg.content}`).join('\n') || 'No messages'}
    `

    // Split text to handle token limits
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 200,
    })

    const docs = await textSplitter.createDocuments([textToSummarize])

    // Initialize LLM
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.3,
    })

    // Create summarization templates
    const summaryTemplate = `
      You are an expert at summarizing customer support tickets.
      Your goal is to create a concise but comprehensive summary of the ticket.
      Below you find the content of a support ticket:
      --------
      {text}
      --------

      Focus on:
      1. The main issue or request
      2. Key details and context provided
      3. Current status and any resolution steps
      4. Important customer interactions

      CONCISE SUMMARY:
    `

    const summaryRefineTemplate = `
      You are an expert at summarizing customer support tickets.
      We have provided an existing summary up to a certain point: {existing_answer}

      Below you find additional ticket content:
      --------
      {text}
      --------

      Given this new context, refine the summary to be more complete.
      If the context isn't useful, return the original summary.
      Focus on maintaining a clear and concise summary that captures all important details.

      REFINED SUMMARY:
    `

    const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate)
    const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(summaryRefineTemplate)

    // Create summarization chain
    const chain = loadSummarizationChain(model, {
      type: "refine",
      verbose: true,
      questionPrompt: SUMMARY_PROMPT,
      refinePrompt: SUMMARY_REFINE_PROMPT,
    })

    // Generate summary
    const summary = await chain.invoke({
      input_documents: docs,
    })

    // Update ticket with summary
    const { error: updateError } = await supabase
      .from("requests")
      .update({ summary: summary.text })
      .eq("id", id)

    if (updateError) {
      console.error('❌ Error updating ticket with summary:', updateError)
      return Response.json(
        { error: "Failed to update ticket with summary", details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Successfully added summary to ticket:', { id })
    return Response.json({ success: true, summary: summary.text })
    
  } catch (error) {
    console.error("❌ Summarization error:", error)
    return Response.json(
      { error: "Failed to generate summary", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 


