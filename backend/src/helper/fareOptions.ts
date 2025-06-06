import { AircraftClass } from '~/constants/aircrafts'

export function buildFareOptionsFilter({
  fareClass,
  minPrice,
  maxPrice,
  minAvailableSeats,
  maxAvailableSeats,
  passengerCount
}: {
  fareClass?: AircraftClass
  minPrice?: number
  maxPrice?: number
  minAvailableSeats?: number
  maxAvailableSeats?: number
  passengerCount?: number
}) {
  const filter: Record<string, any> = {}

  if (fareClass) filter.class = fareClass

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {}
    if (minPrice !== undefined) filter.price.$gte = minPrice
    if (maxPrice !== undefined) filter.price.$lte = maxPrice
  }

  const minSeats = Math.max(minAvailableSeats ?? 0, passengerCount ?? 0)
  if (minSeats > 0 || maxAvailableSeats !== undefined) {
    filter.availableSeats = {}
    if (minSeats > 0) filter.availableSeats.$gte = minSeats
    if (maxAvailableSeats !== undefined) filter.availableSeats.$lte = maxAvailableSeats
  }

  return Object.keys(filter).length > 0 ? filter : undefined
}

export function filterFareOptionsBackend({
  fareOptions,
  fareClass,
  minPrice,
  maxPrice,
  minSeats,
  maxAvailableSeats
}: {
  fareOptions: {
    class: AircraftClass
    price: number
    availableSeats: number
    perks: string[]
  }[]
  fareClass?: AircraftClass
  minPrice?: number
  maxPrice?: number
  minSeats: number
  maxAvailableSeats?: number
}) {
  const order = [AircraftClass.Economy, AircraftClass.Business, AircraftClass.FirstClass]

  return fareOptions
    .filter((fare) => {
      const matchClass = fareClass ? fare.class === fareClass : true
      const matchMinPrice = minPrice !== undefined ? fare.price >= minPrice : true
      const matchMaxPrice = maxPrice !== undefined ? fare.price <= maxPrice : true
      const matchMinSeats = minSeats > 0 ? fare.availableSeats >= minSeats : true
      const matchMaxSeats = maxAvailableSeats !== undefined ? fare.availableSeats <= maxAvailableSeats : true

      return matchClass && matchMinPrice && matchMaxPrice && matchMinSeats && matchMaxSeats
    })
    .sort((a, b) => order.indexOf(a.class) - order.indexOf(b.class))
}
