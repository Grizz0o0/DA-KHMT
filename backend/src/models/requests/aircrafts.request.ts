import { AircraftStatus } from '~/constants/aircrafts'

interface SeatClassConfig {
  rows: number
  seatsPerRow: number
}

export interface CreateAircraftReqBody {
  model: string
  manufacturer: string
  airlineId: string
  aircraftCode: string
  seatConfiguration: {
    economy?: SeatClassConfig
    business?: SeatClassConfig
    firstClass?: SeatClassConfig
  }
}

export interface UpdateAircraftReqBody {
  model?: string
  manufacturer?: string
  seatConfiguration?: {
    economy?: SeatClassConfig
    business?: SeatClassConfig
    firstClass?: SeatClassConfig
  }
  capacity?: number
}

export interface SearchAircraftReqBody {
  limit?: number
  page?: number
  select?: string[]
  content: string
}

export interface GetListAircraftReqBody {
  limit?: number
  page?: number
  order?: string
  select?: string[]
}

export interface FilterAircraft {
  model?: string
  manufacturer?: string
  aircraftCode?: string
  status?: string
  limit?: number
  page?: number
  order?: string
  select?: string[]
}
