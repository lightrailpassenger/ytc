package io.github.lightrailpassenger

import io.github.lightrailpassenger.io.DownloadHelper
import io.github.lightrailpassenger.io.DownloadRecord
import io.github.lightrailpassenger.io.Playlist
import io.github.lightrailpassenger.routes.generateCreateVideoHandler
import io.github.lightrailpassenger.routes.generateInitHandler
import io.github.lightrailpassenger.routes.generateGetVideoHandler
import io.github.lightrailpassenger.routes.generateListVideosHandler
import io.github.lightrailpassenger.routes.generateCleanVideosHandler
import io.github.lightrailpassenger.routes.generateCreatePlaylistHandler
import io.github.lightrailpassenger.routes.generateListAllPlaylistsHandler
import io.github.lightrailpassenger.routes.generatePatchPlaylistHandler
import io.github.lightrailpassenger.routes.generateDeletePlaylistHandler
import io.github.lightrailpassenger.routes.generateGetPlaylistItemsHandler
import io.github.lightrailpassenger.routes.generateSetPlaylistItemsHandler
import io.github.lightrailpassenger.utils.ensureDbDir

import java.io.File

import org.http4k.core.Filter
import org.http4k.core.HttpHandler
import org.http4k.core.Method.GET
import org.http4k.core.Method.POST
import org.http4k.core.Method.PUT
import org.http4k.core.Method.PATCH
import org.http4k.core.Method.DELETE
import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.then
import org.http4k.core.Status.Companion.OK
import org.http4k.sse.SseFilter
import org.http4k.sse.then
import org.http4k.routing.bind as bind
import org.http4k.routing.routes
import org.http4k.routing.sse
import org.http4k.routing.sse.bind as sseBind
import org.http4k.server.PolyHandler
import org.http4k.server.Undertow
import org.http4k.server.asServer

val dbPath = ensureDbDir()
val sqliteFile = File(dbPath, "data.db")
val sqliteFilePath = sqliteFile.getPath()

val downloadHelper = DownloadHelper()
val downloadRecord = DownloadRecord(sqliteFilePath)
val playlist = Playlist(sqliteFilePath)

val createVideo = generateCreateVideoHandler(downloadHelper, downloadRecord)
val init = generateInitHandler(downloadRecord, playlist)
val listVideos = generateListVideosHandler(downloadRecord)
val getVideo = generateGetVideoHandler()
val cleanVideos = generateCleanVideosHandler(downloadRecord, sqliteFile)

val createPlaylist = generateCreatePlaylistHandler(playlist)
val getPlaylists = generateListAllPlaylistsHandler(playlist)
val patchPlaylist = generatePatchPlaylistHandler(playlist)
val deletePlaylist = generateDeletePlaylistHandler(playlist)
val getPlaylistItems = generateGetPlaylistItemsHandler(playlist)
val setPlaylistItems = generateSetPlaylistItemsHandler(playlist)

val http = routes(
    "/init" bind POST to init,
    "/ping" bind GET to {
        Response(OK).body("pong")
    },
    "/videos/{createdAt}" bind GET to getVideo,
    "/downloaded-videos" bind GET to listVideos,
    "/garbage-videos" bind DELETE to cleanVideos,
    "/playlists/{playlistId}" bind GET to getPlaylistItems,
    "/playlists/{playlistId}" bind PUT to setPlaylistItems,
    "/playlists/{playlistId}" bind PATCH to patchPlaylist,
    "/playlists/{playlistId}" bind DELETE to deletePlaylist,
    "/playlists" bind GET to getPlaylists,
    "/playlists" bind POST to createPlaylist
)

val sse = sse(
    "/videos" sseBind { request ->
        createVideo(request)
    }
)

val responseHeaderFilter = Filter {
    next: HttpHandler -> {
        request: Request -> next(request).header("Access-Control-Allow-Origin", "http://localhost:5173")
    }
}

val sseResponseFilter = SseFilter {
    next -> {
        request -> next(request).copy(headers = listOf("Access-Control-Allow-Origin" to "*"))
    }
}

fun main() {
    val server = PolyHandler(responseHeaderFilter.then(http), sse = sseResponseFilter.then(sse)).asServer(Undertow(9000)).start()

    println("Server started on " + server.port())
}
