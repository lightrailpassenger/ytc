package io.github.lightrailpassenger

import io.github.lightrailpassenger.io.DownloadHelper
import io.github.lightrailpassenger.routes.generateCreateVideoHandler
import org.http4k.core.Method.GET
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.routing.bind as bind
import org.http4k.routing.routes
import org.http4k.routing.sse
import org.http4k.routing.sse.bind as sseBind
import org.http4k.server.PolyHandler
import org.http4k.server.Undertow
import org.http4k.server.asServer

val http = routes(
    "/ping" bind GET to {
        Response(OK).body("pong")
    },
)

val downloadHelper = DownloadHelper()
val createVideo = generateCreateVideoHandler(downloadHelper)

val sse = sse(
    "/videos" sseBind { request ->
        createVideo(request)
    }
)

fun main() {
    val server = PolyHandler(http, sse = sse).asServer(Undertow(9000)).start()

    println("Server started on " + server.port())
}
