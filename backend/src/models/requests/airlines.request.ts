export interface CreateAirlineReqBody {
  name: string
  code: string
  logo?: string
  description?: string
}

export interface UpdateAirlineReqBody {
  name?: string
  code?: string
  logo?: string
  description?: string
}

export interface GetListAirlineReqBody {
  limit?: number
  page?: number
  order?: string
  select?: string[]
}

export interface GetAirlineByCodeReqBody {
  limit?: number
  page?: number
  code: string
}

export interface SearchAirlineReqBody {
  limit?: number
  page?: number
  content: string
  select?: string[]
}
