package io.github.lightrailpassenger.routes

import java.io.File
import java.io.FileInputStream

import org.http4k.core.Body
import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.core.Status.Companion.NOT_FOUND
import org.http4k.core.Status.Companion.INTERNAL_SERVER_ERROR
import org.http4k.routing.path

import com.fasterxml.jackson.databind.ObjectMapper

import io.github.lightrailpassenger.formats.ErrorResponse
import io.github.lightrailpassenger.utils.ensureStorage

fun generateGetVideoHandler(): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            val createdAt = request.path("createdAt")
            val dir = File(ensureStorage(), createdAt)

            for (file in dir.listFiles()) {
                if (file.isFile() && file.getName().endsWith(".webm")) {
                    val inputStream = FileInputStream(file)

                    return Response(OK).header("Content-Type", "video/webm").body(inputStream)
                }
            }

            return Response(NOT_FOUND).body(ObjectMapper().writeValueAsString(ErrorResponse("NOT_FOUND")))
        } catch (err: Throwable) {
            println(err)
            return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
        }
    }
}
