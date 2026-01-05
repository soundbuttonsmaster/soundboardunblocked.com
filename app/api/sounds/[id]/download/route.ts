import { type NextRequest, NextResponse } from "next/server"
import { API_BASE_URL } from "@/lib/api/constants"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const numericId = Number.parseInt(id, 10)

    if (isNaN(numericId) || numericId < 1) {
      return NextResponse.json({ error: "Invalid sound ID" }, { status: 400 })
    }

    // Proxy the download request to the API
    const downloadUrl = `${API_BASE_URL}/sounds/${numericId}/audio?download=true`
    
    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        "Accept": "audio/mpeg, audio/*, */*",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to download sound" },
        { status: response.status }
      )
    }

    // Get the audio file as a blob
    const blob = await response.blob()
    
    // Get the filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition")
    let filename = `sound-${numericId}.mp3`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "")
      }
    }

    // Return the blob with proper headers for download
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error downloading sound:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

