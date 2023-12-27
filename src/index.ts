import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt, Principal} from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Donor = Record<{
    id: string;
    name: string;
    email: string;
    donor_type:  string; // (Individual, corporate, regular, occasional)
    feedbacks: Vec<string>;
    donation_history:Vec<string>,
    created_date: nat64;
    updated_at: Opt<nat64>;
}>

type Donation = Record<{
    id: string;
    amount: nat64;
    date: string;
    donorId: string; // Link to the donor
    campaignId: nat64; // Link to the campaign
    created_date: nat64;
    updated_at: Opt<nat64>;
}>


type DonorPayload = Record<{
    name: string;
    email: string;
    donor_type:  string;
}>

type DonationPayload = Record <{
    amount: nat64;
    date: string;
    donorId: string; // Link to the donor
    campaignId: nat64; // Link to the campaign
}>

const donorStorage = new StableBTreeMap<string, Donor>(0, 44, 512);
const donationStorage = new StableBTreeMap<string, Donation>(1, 44, 512);



//Add a New Donor 
$update
export function add_Donor(payload: DonorPayload): Result<Donor, string> {
  

    try {
        const newDonor: Donor = {
            id: uuidv4(),
            feedbacks: [],
            donation_history: [],
            created_date: ic.time(),
            updated_at: Opt.None,
            ...payload
        };
        donorStorage.insert(newDonor.id, newDonor);
        return Result.Ok<Donor, string>(newDonor);
    } catch (err) {
        return Result.Err<Donor, string>('Donor creation Unsuccesfull ');
    }
}


// Update Donor 
$update
export function updateDonor(id: string, payload: DonorPayload): Result<Donor, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            const updatedDonor: Donor = { ...donor, ...payload, updated_at: Opt.Some(ic.time()) };
            donorStorage.insert(donor.id, updatedDonor);
            return Result.Ok<Donor, string>(updatedDonor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
    });
}

// get Donor by Id 
$query
export function getDonor(id: string): Result<Donor, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            return Result.Ok<Donor, string>(donor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
    });
}
// get All donors
$query
export function getAllDonors(): Result<Vec<Donor>, string>{
    const donors = donorStorage.values();
    return Result.Ok(donors)
}
// Delete a Donor 
$update
export function deleteDonor(id: string): Result<Donor, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            donorStorage.remove(id);
            return Result.Ok<Donor, string>(donor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found, could not be deleted`),
    });
}


// function for Donor to add  feedbacks
$update
export function donorToAddFeedback(id: string, feedback: string): Result<Donor, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            const updateFeedbacks = [...donor.feedbacks, feedback];
            const updatedDonor: Donor = { ...donor, feedbacks: updateFeedbacks };
            donorStorage.insert(donor.id, updatedDonor);
            return Result.Ok<Donor, string>(updatedDonor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
    });
}

// function to add donation history 
$update
export function insertDonationHistory(id: string, history: string): Result<Donor, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            const updateHistory = [...donor.donation_history, history];
            const updatedDonor: Donor = { ...donor, donation_history: updateHistory };
            donorStorage.insert(donor.id, updatedDonor);
            return Result.Ok<Donor, string>(updatedDonor);
        },
        None: () => Result.Err<Donor, string>(`Donor with id:${id} not found`),
    });
}



// function to get donation history
$query
export function getDonationHistory(id: string): Result<Vec<string>, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            return Result.Ok<Vec<string>, string>(donor.donation_history);
        },
        None: () => Result.Err<Vec<string>, string>(`Donor with id:${id} not found`),
    });
}

// function to get feedbacks
$query
export function getFeedbacks(id: string): Result<Vec<string>, string> {
    return match(donorStorage.get(id), {
        Some: (donor) => {
            return Result.Ok<Vec<string>, string>(donor.feedbacks);
        },
        None: () => Result.Err<Vec<string>, string>(`Donor with id:${id} not found`),
    });
}


// CRUD  donation


//Add a New Donation
$update
export function addDonation(payload: DonationPayload): Result<Donation, string> {
    try {
        const newDonation: Donation = {
            id: uuidv4(),
            created_date: ic.time(),
            updated_at: Opt.None,
            ...payload
        };
        donationStorage.insert(newDonation.id, newDonation);
        return Result.Ok<Donation, string>(newDonation);
    } catch (err) {
        return Result.Err<Donation, string>('Donation creation Unsuccesfull ');
    }
}

// Update Donation
$update
export function updateDonation(id: string, payload: DonationPayload): Result<Donation, string> {
    return match(donationStorage.get(id), {
        Some: (donation) => {
            const updatedDonation: Donation = { ...donation, ...payload, updated_at: Opt.Some(ic.time()) };
            donationStorage.insert(donation.id, updatedDonation);
            return Result.Ok<Donation, string>(updatedDonation);
        },
        None: () => Result.Err<Donation, string>(`Donation with id:${id} not found`),
    });
}

// get Donation by Id
$query
export function getDonation(id: string): Result<Donation, string> {
    return match(donationStorage.get(id), {
        Some: (donation) => {
            return Result.Ok<Donation, string>(donation);
        },
        None: () => Result.Err<Donation, string>(`Donation with id:${id} not found`),
    });
}

// get All donations
$query
export function getAllDonations(): Result<Vec<Donation>, string>{
    const donations = donationStorage.values();
    return Result.Ok(donations)
}

// Delete a Donation
$update
export function deleteDonation(id: string): Result<Donation, string> {
    return match(donationStorage.get(id), {
        Some: (donation) => {
            donationStorage.remove(id);
            return Result.Ok<Donation, string>(donation);
        },
        None: () => Result.Err<Donation, string>(`Donation with id:${id} not found, could not be deleted`),
    });
}

// calculate total donation
$query
export function totalDonation(): Result<number, string> {
    const donations = donationStorage.values();
    let total = 0;
    donations.forEach((donation) => {
        total += Number(donation.amount);
    });
    return Result.Ok<number, string>(total);
}

// Get total donation of donor Id
$query
export function getTotalDonation(donorId: string): Result<number, string> {
    const donations = donationStorage.values();
    const totalDonation = donations.reduce((acc, donation) => {
        if (donation.donorId === donorId) {
            return acc += Number(donation.amount);
        }
        return acc;
    }, 0);
    return Result.Ok<number, string>(totalDonation);
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