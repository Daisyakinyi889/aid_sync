import {
    $query,
    $update,
    Record,
    StableBTreeMap,
    Vec,
    match,
    Result,
    nat64,
    ic,
    Opt,
  } from 'azle';
  import { v4 as uuidv4 } from 'uuid';
  
  type Donor = Record<{
    id: string;
    name: string;
    email: string;
    donor_type: string; // (Individual, corporate, regular, occasional)
    feedbacks: Vec<string>;
    donation_history: Vec<string>;
    created_date: nat64;
    updated_at: Opt<nat64>;
  }>;
  
  type Donation = Record<{
    id: string;
    amount: nat64;
    date: string;
    donorId: string; // Link to the donor
    campaignId: nat64; // Link to the campaign
    created_date: nat64;
    updated_at: Opt<nat64>;
  }>;
  
  type DonorPayload = Record<{
    name: string;
    email: string;
    donor_type: string;
  }>;
  
  type DonationPayload = Record<{
    amount: nat64;
    date: string;
    donorId: string; // Link to the donor
    campaignId: nat64; // Link to the campaign
  }>;
  
  const donorStorage = new StableBTreeMap<string, Donor>(0, 44, 512);
  const donationStorage = new StableBTreeMap<string, Donation>(1, 44, 512);
  
  // Add a New Donor
  $update
  export function add_Donor(payload: DonorPayload): Result<Donor, string> {
    try {
      // Payload Validation
      if (!payload.name || !payload.email || !payload.donor_type) {
        return Result.Err<Donor, string>('Invalid donor payload');
      }
  
      // ID Validation
      const newDonorId = uuidv4();
  
      const newDonor: Donor = {
        id: newDonorId,
        feedbacks: [],
        donation_history: [],
        created_date: ic.time(),
        updated_at: Opt.None,
        ...payload,
      };
  
      donorStorage.insert(newDonor.id, newDonor);
      return Result.Ok<Donor, string>(newDonor);
    } catch (err) {
      return Result.Err<Donor, string>('Donor creation unsuccessful');
    }
  }
  
  // Update Donor
  $update
  export function updateDonor(id: string, payload: DonorPayload): Result<Donor, string> {
    try {
      // ID Validation
      if (typeof id !== 'string') {
        return Result.Err<Donor, string>('Invalid donor ID');
      }
  
      // Payload Validation
      if (!payload.name || !payload.email || !payload.donor_type) {
        return Result.Err<Donor, string>('Invalid donor payload');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => {
          // Individual Property Assignment
          const updatedDonor: Donor = {
            ...donor,
            name: payload.name || donor.name,
            email: payload.email || donor.email,
            donor_type: payload.donor_type || donor.donor_type,
            updated_at: Opt.Some(ic.time()),
          };
  
          donorStorage.insert(donor.id, updatedDonor);
          return Result.Ok<Donor, string>(updatedDonor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Donor, string>(`Failed to update donor with id:${id}`);
    }
  }
  
  // get Donor by Id
  $query
  export function getDonor(id: string): Result<Donor, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id ) {
        return Result.Err<Donor, string>('Invalid donor ID');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => Result.Ok<Donor, string>(donor),
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Donor, string>(`Failed to retrieve donor with id:${id}`);
    }
  }
  
  // get All donors
  $query
  export function getAllDonors(): Result<Vec<Donor>, string> {
    try {
      const donors = donorStorage.values();
      return Result.Ok(donors);
    } catch (error) {
      return Result.Err(`Failed to retrieve all donors: ${error}`);
    }
  }
  
  // Delete a Donor
  $update
  export function deleteDonor(id: string): Result<Donor, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Donor, string>('Invalid donor ID');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => {
          donorStorage.remove(id);
          return Result.Ok<Donor, string>(donor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found, could not be deleted`),
      });
    } catch (error) {
      return Result.Err<Donor, string>(`Failed to delete donor with id:${id}`);
    }
  }
  
  // function for Donor to add feedbacks
  $update
  export function donorToAddFeedback(id: string, feedback: string): Result<Donor, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id  || !feedback) {
        return Result.Err<Donor, string>('Invalid donor ID');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => {
          const updateFeedbacks = [...donor.feedbacks, feedback];
          const updatedDonor: Donor = { ...donor, feedbacks: updateFeedbacks };
          donorStorage.insert(donor.id, updatedDonor);
          return Result.Ok<Donor, string>(updatedDonor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Donor, string>(`Failed to add feedback for donor with id:${id}`);
    }
  }
  
  // function to add donation history
  $update
  export function insertDonationHistory(id: string, history: string): Result<Donor, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Donor, string>('Invalid donor ID');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => {
          const updateHistory = [...donor.donation_history, history];
          const updatedDonor: Donor = { ...donor, donation_history: updateHistory };
          donorStorage.insert(donor.id, updatedDonor);
          return Result.Ok<Donor, string>(updatedDonor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Donor, string>(`Failed to insert donation history for donor with id:${id}`);
    }
  }
  
  // function to get donation history
  $query
  export function getDonationHistory(id: string): Result<Vec<string>, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Vec<string>, string>('Invalid donor ID');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => Result.Ok<Vec<string>, string>(donor.donation_history),
        None: () => Result.Err<Vec<string>, string>(`Donor with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Vec<string>, string>(`Failed to retrieve donation history for donor with id:${id}`);
    }
  }
  
  // function to get feedbacks
  $query
  export function getFeedbacks(id: string): Result<Vec<string>, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Vec<string>, string>('Invalid donor ID');
      }
  
      return match(donorStorage.get(id), {
        Some: (donor) => Result.Ok<Vec<string>, string>(donor.feedbacks),
        None: () => Result.Err<Vec<string>, string>(`Donor with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Vec<string>, string>(`Failed to retrieve feedbacks for donor with id:${id}`);
    }
  }
  
  // CRUD donation
  
  // Add a New Donation
  $update
  export function addDonation(payload: DonationPayload): Result<Donation, string> {
    try {
      // Payload Validation
      if (!payload.amount || !payload.date || !payload.donorId || !payload.campaignId) {
        return Result.Err<Donation, string>('Invalid donation payload');
      }
  
      const newDonation: Donation = {
        id: uuidv4(),
        created_date: ic.time(),
        updated_at: Opt.None,
        ...payload,
      };
  
      donationStorage.insert(newDonation.id, newDonation);
      return Result.Ok<Donation, string>(newDonation);
    } catch (err) {
      return Result.Err<Donation, string>('Donation creation unsuccessful');
    }
  }
  
  // Update Donation
  $update
  export function updateDonation(id: string, payload: DonationPayload): Result<Donation, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Donation, string>('Invalid donation ID');
      }
  
      return match(donationStorage.get(id), {
        Some: (donation) => {
          // Individual Property Assignment
          const updatedDonation: Donation = {
            ...donation,
            amount: payload.amount || donation.amount,
            date: payload.date || donation.date,
            donorId: payload.donorId || donation.donorId,
            campaignId: payload.campaignId || donation.campaignId,
            updated_at: Opt.Some(ic.time()),
          };
  
          donationStorage.insert(donation.id, updatedDonation);
          return Result.Ok<Donation, string>(updatedDonation);
        },
        None: () => Result.Err<Donation, string>(`Donation with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Donation, string>(`Failed to update donation with id:${id}`);
    }
  }
  
  // get Donation by Id
  $query
  export function getDonation(id: string): Result<Donation, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Donation, string>('Invalid donation ID');
      }
  
      return match(donationStorage.get(id), {
        Some: (donation) => Result.Ok<Donation, string>(donation),
        None: () => Result.Err<Donation, string>(`Donation with id:${id} not found`),
      });
    } catch (error) {
      return Result.Err<Donation, string>(`Failed to retrieve donation with id:${id}`);
    }
  }
  
  // get All donations
  $query
  export function getAllDonations(): Result<Vec<Donation>, string> {
    try {
      const donations = donationStorage.values();
      return Result.Ok(donations);
    } catch (error) {
      return Result.Err(`Failed to retrieve all donations: ${error}`);
    }
  }
  
  // Delete a Donation
  $update
  export function deleteDonation(id: string): Result<Donation, string> {
    try {
      // ID Validation
      if (typeof id !== 'string' || !id) {
        return Result.Err<Donation, string>('Invalid donation ID');
      }
  
      return match(donationStorage.get(id), {
        Some: (donation) => {
          donationStorage.remove(id);
          return Result.Ok<Donation, string>(donation);
        },
        None: () => Result.Err<Donation, string>(`Donation with id:${id} not found, could not be deleted`),
      });
    } catch (error) {
      return Result.Err<Donation, string>(`Failed to delete donation with id:${id}`);
    }
  }
  
  // Calculate total donation
  $query
  export function totalDonation(): Result<number, string> {
    try {
      const donations = donationStorage.values();
      let total = 0;
      donations.forEach((donation) => {
        total += Number(donation.amount);
      });
      return Result.Ok<number, string>(total);
    } catch (error) {
      return Result.Err<number, string>(`Failed to calculate total donation: ${error}`);
    }
  }
  
  // Get total donation of donor Id
  $query
  export function getTotalDonation(donorId: string): Result<number, string> {
    try {
      // ID Validation
      if (typeof donorId !== 'string' || !donorId) {
        return Result.Err<number, string>('Invalid donor ID');
      }
  
      const donations = donationStorage.values();
      const totalDonation = donations.reduce((acc, donation) => {
        if (donation.donorId === donorId) {
          return acc += Number(donation.amount);
        }
        return acc;
      }, 0);
  
      return Result.Ok<number, string>(totalDonation);
    } catch (error) {
      return Result.Err<number, string>(`Failed to retrieve total donation for donor with id:${donorId}`);
    }
  }
  
  // UUID workaround
  globalThis.crypto = {
    // @ts-ignore
    getRandomValues: () => {
      let array = new Uint8Array(32);
  
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
  
      return array;
    },
  };
  