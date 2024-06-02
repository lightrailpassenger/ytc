package io.github.lightrailpassenger.utils

import java.io.File

fun ensureStorage(): File {
    val homePath = System.getProperty("user.home")
    val storageDir = File(homePath, ".ytc__cache")
    storageDir.mkdirs()

    return storageDir
}
