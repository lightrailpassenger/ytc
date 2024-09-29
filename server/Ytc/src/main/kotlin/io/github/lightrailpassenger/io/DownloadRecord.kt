package io.github.lightrailpassenger.io

import java.sql.Connection
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.*

object DownloadRecordData: Table() {
    val url: Column<String> = text("url")
    val createdAt: Column<String> = text("createdAt")
    val name: Column<String> = text("name")

    override val primaryKey = PrimaryKey(url, name = "DownloadRecord_pkey")
}

data class DownloadRecordEntry (
    val url: String,
    val createdAt: String,
    val name: String
)

class DownloadRecord {
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
            SchemaUtils.create(DownloadRecordData)
        }
    }

    fun insert(newUrl: String, newCreatedAt: String, newName: String) {
        this.connect()
        transaction {
            DownloadRecordData.upsert {
                it[url] = newUrl
                it[createdAt] = newCreatedAt
                it[name] = newName
            }
        }
    }

    fun listAll(): List<DownloadRecordEntry> {
        this.connect()
        var result: List<DownloadRecordEntry> = emptyList()
        transaction {
            result = DownloadRecordData.selectAll().map {
                DownloadRecordEntry(
                    it[DownloadRecordData.url],
                    it[DownloadRecordData.createdAt],
                    it[DownloadRecordData.name]
                )
            }
        }

        return result
    }

    fun selectByUrl(url: String): DownloadRecordEntry? {
        this.connect()
        var result: DownloadRecordEntry? = null;
        transaction {
            val selected = DownloadRecordData.selectAll().where {
                DownloadRecordData.url eq url
            }.limit(1).map {
                DownloadRecordEntry(
                    it[DownloadRecordData.url],
                    it[DownloadRecordData.createdAt],
                    it[DownloadRecordData.name]
                )
            }

            result = if (selected.isEmpty()) null else selected[0]
        }

        return result
    }
}
