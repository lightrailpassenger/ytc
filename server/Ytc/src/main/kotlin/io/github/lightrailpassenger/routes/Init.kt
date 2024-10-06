package io.github.lightrailpassenger.routes

import com.fasterxml.jackson.databind.ObjectMapper

import io.github.lightrailpassenger.formats.ErrorResponse
import io.github.lightrailpassenger.io.DownloadRecord

import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.Status.Companion.NO_CONTENT
import org.http4k.core.Status.Companion.INTERNAL_SERVER_ERROR

fun generateInitHandler(
    downloadRecord: DownloadRecord
): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            downloadRecord.createTable()

            return Response(NO_CONTENT)
        } catch (err: Throwable) {
            System.err.println(err)
            return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
        }
    }
}
