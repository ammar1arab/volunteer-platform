class Location {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly address: string
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new Error("Invalid latitude");
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error("Invalid longitude");
    }
    if (!address?.trim()) {
      throw new Error("Address is required");
    }
  }

  toObject() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
      address: this.address,
    };
  }
}

export default Location;