package io.github.lightrailpassenger.formats

import org.http4k.core.Body
import org.http4k.format.Jackson.auto

data class ErrorResponse(
    val err: String
)

val errorResponseLens = Body.auto<ErrorResponse>().toLens()
