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

            var fileNameLength: Int? = null
            var file: File? = null

            for (currentFile in dir.listFiles()) {
                val fileName = currentFile.getName()

                if (currentFile.isFile() && fileName.endsWith(".mp4") && (fileNameLength == null || fileName.length < fileNameLength)) {
                    fileNameLength = fileName.length
                    file = currentFile
                }
            }

            if (file != null) {
                val inputStream = FileInputStream(file)

                return Response(OK).header("Content-Type", "video/mp4").body(inputStream)
            }

            return Response(NOT_FOUND).body(ObjectMapper().writeValueAsString(ErrorResponse("NOT_FOUND")))
        } catch (err: Throwable) {
            System.err.println(err)
            return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
        }
    }
}
