export interface CreateAirportReqBody {
  name: string
  code: string
  address?: string
  city?: string
  country?: string
}

export interface UpdateAirportReqBody {
  name?: string
  code?: string
  address?: string
  city?: string
  country?: string
}

export interface FilterAirportReqBody {
  city?: string
  country?: string
  limit?: number
  page?: number
  order?: string
  select?: string[]
}

export interface GetListAirportReqBody {
  limit?: number
  page?: number
  order?: string
  select?: string[]
}

export interface GetAirportByCodeReqBody {
  limit?: number
  page?: number
  code: string
}

export interface SearchAirportReqBody {
  limit?: number
  page?: number
  content: string
  select?: string[]
}
