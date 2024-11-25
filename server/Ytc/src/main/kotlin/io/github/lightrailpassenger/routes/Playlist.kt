package io.github.lightrailpassenger.routes

import com.fasterxml.jackson.databind.ObjectMapper

import io.github.lightrailpassenger.formats.ErrorResponse
import io.github.lightrailpassenger.io.Playlist
import io.github.lightrailpassenger.io.PlaylistEntry
import io.github.lightrailpassenger.io.PlaylistItemEntry

import org.http4k.core.Body
import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.core.Status.Companion.NO_CONTENT
import org.http4k.core.Status.Companion.BAD_REQUEST
import org.http4k.core.Status.Companion.FORBIDDEN
import org.http4k.core.Status.Companion.NOT_FOUND
import org.http4k.core.Status.Companion.INTERNAL_SERVER_ERROR
import org.http4k.core.with
import org.http4k.format.Jackson.auto
import org.http4k.lens.LensFailure
import org.http4k.routing.path

import org.jetbrains.exposed.exceptions.ExposedSQLException

data class CreatePlaylistRequestBody(
    val name: String
)

data class CreatePlaylistResponseBody(
    val id: String
)

val createPlaylistRequestBodyLens = Body.auto<CreatePlaylistRequestBody>().toLens()
val createPlaylistResponseBodyLens = Body.auto<CreatePlaylistResponseBody>().toLens()

fun generateCreatePlaylistHandler(
    playlist: Playlist
): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            val body = createPlaylistRequestBodyLens(request)
            val name = body.name
            val id = playlist.insert(name)

            return Response(OK).with(
                createPlaylistResponseBodyLens of CreatePlaylistResponseBody(id)
            )
        } catch (ex: Throwable) {
            when (ex) {
                is LensFailure -> {
                    return Response(BAD_REQUEST).body(ObjectMapper().writeValueAsString(ErrorResponse("BAD_REQUEST")))
                }
                else -> {
                    System.err.println(ex)
                    return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
                }
            }
        }
    }
}

data class ListAllPlaylistsResponseBody(
    val playlists: List<PlaylistEntry>
)

val listAllPlaylistsBodyLens = Body.auto<ListAllPlaylistsResponseBody>().toLens()

fun generateListAllPlaylistsHandler(
    playlist: Playlist
): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            val playlists = playlist.getAll()

            return Response(OK).with(
                listAllPlaylistsBodyLens of ListAllPlaylistsResponseBody(playlists)
            )
        } catch (err: Throwable) {
            System.err.println(err)
            return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
        }
    }
}

data class GetPlaylistItemsResponseBody(
    val urls: List<String>
)

val getPlaylistItemsBodyLens = Body.auto<GetPlaylistItemsResponseBody>().toLens()

fun generateGetPlaylistItemsHandler(
    playlist: Playlist
): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            val playlistId = request.path("playlistId")

            if (playlistId == null) {
                return Response(BAD_REQUEST).body(ObjectMapper().writeValueAsString(ErrorResponse("BAD_REQUEST")))
            }

            val entry = playlist.getItems(playlistId)

            if (entry == null) {
                return Response(NOT_FOUND).body(
                    ObjectMapper().writeValueAsString(ErrorResponse("NOT_FOUND"))
                )
            }

            return Response(OK).with(
                getPlaylistItemsBodyLens of GetPlaylistItemsResponseBody(entry.urls)
            )
        } catch (err: Throwable) {
            System.err.println(err)
            return Response(INTERNAL_SERVER_ERROR).body(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR")))
        }
    }
}

data class SetPlaylistItemsRequestBody (
    val urls: List<String>
)

val setPlaylistItemsBodyLens = Body.auto<SetPlaylistItemsRequestBody>().toLens()

fun generateSetPlaylistItemsHandler(
    playlist: Playlist
): (request: Request) -> Response {
    return fun(request: Request): Response {
        try {
            val playlistId = request.path("playlistId")

            if (playlistId == null) {
                return Response(BAD_REQUEST).body(ObjectMapper().writeValueAsString(ErrorResponse("BAD_REQUEST")))
            }

            playlist.setItems(PlaylistItemEntry(
                playlistId,
                setPlaylistItemsBodyLens(request).urls
            ))

            return Response(NO_CONTENT)
        } catch (ex: Throwable) {
            when (ex) {
                is LensFailure -> {
                    return Response(BAD_REQUEST).body(
                        ObjectMapper().writeValueAsString(ErrorResponse("BAD_REQUEST"))
                    )
                }
                is ExposedSQLException -> {
                    return Response(FORBIDDEN).body(
                        ObjectMapper().writeValueAsString(ErrorResponse("FORBIDDEN"))
                    )
                }
                else -> {
                    System.err.println(ex)

                    return Response(INTERNAL_SERVER_ERROR).body(
                        ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR"))
                    )
                }
            }
        }
    }
}
