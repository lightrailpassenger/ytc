package io.github.lightrailpassenger.io

import java.util.UUID

import java.sql.Connection
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq

object PlaylistData: Table() {
    val id: Column<String> = text("id")
    val name: Column<String> = text("name")

    override val primaryKey = PrimaryKey(id, name = "Playlist_pkey")
}

data class PlaylistEntry (
    val id: String,
    val name: String
)

object PlaylistItemData: Table() {
    val playlistId: Column<String> = reference(
        "playlistId",
        PlaylistData.id,
        ReferenceOption.CASCADE
    )
    val order: Column<Int> = integer("order")
    val url: Column<String> = reference(
        "url",
        DownloadRecordData.url,
        ReferenceOption.CASCADE
    )

    override val primaryKey = PrimaryKey(playlistId, order, name = "PlaylistItem_pkey")
}

data class PlaylistItemEntry (
    val playlistId: String,
    val urls: List<String>
)

class Playlist {
    val fullPath: String

    constructor(path: String) {
        this.fullPath = "jdbc:sqlite:$path"
    }

    private fun connect() {
        Database.connect(fullPath, "org.sqlite.JDBC")
        TransactionManager.manager.defaultIsolationLevel = Connection.TRANSACTION_SERIALIZABLE
    }

    fun createTable(): Unit {
        this.connect()
        transaction {
            SchemaUtils.create(PlaylistData, PlaylistItemData)
        }
    }

    fun insert(newName: String): String {
        this.connect()
        val uuid = UUID.randomUUID().toString()

        transaction {
            PlaylistData.insert {
                it[id] = uuid
                it[name] = newName
            }
        }

        return uuid;
    }

    fun getAll(): List<PlaylistEntry> {
        this.connect()
        var result: List<PlaylistEntry> = emptyList()
        transaction {
            result = PlaylistData.selectAll().map {
                PlaylistEntry(
                    it[PlaylistData.id],
                    it[PlaylistData.name]
                )
            }
        }

        return result
    }

    fun delete(id: String) {
        this.connect()
        transaction {
            PlaylistData.deleteWhere {
                PlaylistData.id eq id
            }
        }
    }

    fun setItems(entry: PlaylistItemEntry) {
        this.connect()
        transaction {
            for ((i, u) in entry.urls.withIndex()) {
                PlaylistItemData.upsert {
                    it[playlistId] = entry.playlistId
                    it[order] = i
                    it[url] = u
                }
            }

            PlaylistItemData.deleteWhere {
                (PlaylistItemData.playlistId eq entry.playlistId) and
                (PlaylistItemData.order greaterEq entry.urls.size)
            }
        }
    }

    fun getItems(id: String): PlaylistItemEntry? {
        this.connect()
        var urls: List<String>? = null
        transaction {
            val playlist = PlaylistData.select(PlaylistData.id).where {
                PlaylistData.id eq id
            }.limit(1).map { it[PlaylistData.id] }

            if (playlist.isEmpty()) {
                urls = null
            } else {
                val result = PlaylistItemData.selectAll().where {
                    PlaylistItemData.playlistId eq id
                }.orderBy(PlaylistItemData.order to SortOrder.ASC)

                urls = result.map {
                    it[PlaylistItemData.url]
                }
            }
        }

        if (urls != null) {
            return PlaylistItemEntry(id, urls as List<String>)
        } else {
            return null
        }
    }
}
