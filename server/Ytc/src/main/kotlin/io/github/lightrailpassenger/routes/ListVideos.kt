package io.github.lightrailpassenger.routes

import com.fasterxml.jackson.databind.ObjectMapper

import io.github.lightrailpassenger.formats.ErrorResponse
import io.github.lightrailpassenger.io.DownloadRecord
import io.github.lightrailpassenger.io.DownloadRecordEntry

import org.http4k.core.Body
import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.core.Status.Companion.INTERNAL_SERVER_ERROR
import org.http4k.core.with
import org.http4k.format.Jackson.auto

data class ListVideoResponseBody (
    val videos: List<DownloadRecordEntry>
)

val listVideosBodyLens = Body.auto<ListVideoResponseBody>().toLens()

fun generateListVideosHandler(
    downloadRecord: DownloadRecord
): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            val results = downloadRecord.listAll()

            return Response(OK).with(
                listVideosBodyLens of ListVideoResponseBody(
                    results
                )
            )
        } catch (err: Throwable) {
            System.err.println(err)
            return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
        }
    }
}
