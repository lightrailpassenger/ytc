package io.github.lightrailpassenger.utils

import java.io.File

fun ensureDbDir(): File {
    val homePath = System.getProperty("user.home")
    val storageDir = File(homePath, ".ytc__cache")
    val dbDir = File(storageDir, "db")
    dbDir.mkdirs()

    return dbDir
}

fun ensureStorage(): File {
    val homePath = System.getProperty("user.home")
    val storageDir = File(homePath, ".ytc__cache")
    val cachedDir = File(storageDir, "cached")
    cachedDir.mkdirs()

    return cachedDir
}
