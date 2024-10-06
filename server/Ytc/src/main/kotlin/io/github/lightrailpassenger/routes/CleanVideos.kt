package io.github.lightrailpassenger.routes

import io.github.lightrailpassenger.io.DownloadRecord
import io.github.lightrailpassenger.utils.ensureDbDir
import io.github.lightrailpassenger.utils.ensureStorage

import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.nio.file.Files

import org.http4k.core.Request
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.core.Status.Companion.INTERNAL_SERVER_ERROR

fun generateCleanVideosHandler(
    downloadRecord: DownloadRecord,
    sqliteFile: File,
): (request: Request) -> Response {
    return fun(request: Request): Response {
        var deletedCount = 0

        try {
            val allVideos = downloadRecord.listAll()
            val storageDir = ensureStorage()
            val dbDir = ensureDbDir()

            val now = System.currentTimeMillis()
            Files.copy(sqliteFile.toPath(), FileOutputStream(File(dbDir, "data-backup-$now")))


            for (video in allVideos) {
                val createdAt = video.createdAt
                val cacheDir = File(storageDir, createdAt)

                try {
                    var hasVideo = false;
                    val files = cacheDir.listFiles();

                    if (files == null) {
                        println("Deleting $createdAt")
                        deletedCount++
                        downloadRecord.delete(createdAt)
                        continue;
                    }

                    for (file in files) {
                        if (file.getName().endsWith(".mp4")) {
                            hasVideo = true;
                            break;
                        }
                    }

                    if (!hasVideo) {
                        println("Deleting $createdAt")
                        deletedCount++
                        downloadRecord.delete(createdAt);
                        cacheDir.delete();
                    }
                } catch (ex: Exception) {
                    if (!(ex is IOException)) {
                        throw ex;
                    }
                }
            }

            return Response(OK).body("{\"count\":$deletedCount}")
        } catch (err: Throwable) {
            System.err.println(err)
            return Response(INTERNAL_SERVER_ERROR).body("{\"count\":$deletedCount}")
        }
    }
}
