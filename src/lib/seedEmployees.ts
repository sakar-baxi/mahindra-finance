/**
 * Seed data: 150+ employees per corporate for up to 3 corporates (Mahindra Finance demo).
 * New corporates added via onboarding get different employee records (handled in Dashboard).
 */

const FIRST_NAMES = [
  "Aarav", "Diya", "Kabir", "Priya", "Rohan", "Ananya", "Vikram", "Meera", "Arjun", "Sneha",
  "Aditya", "Kavya", "Rahul", "Ishita", "Siddharth", "Neha", "Karthik", "Pooja", "Varun", "Riya",
  "Akash", "Shreya", "Vivek", "Nisha", "Rajesh", "Kriti", "Manish", "Divya", "Sandeep", "Pallavi",
  "Ravi", "Anjali", "Kiran", "Swati", "Deepak", "Preeti", "Anil", "Rekha", "Sunil", "Kavita",
  "Vijay", "Suman", "Ramesh", "Lakshmi", "Suresh", "Geeta", "Mahesh", "Sarita", "Dinesh", "Neeta",
];

const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Reddy", "Mehta", "Joshi", "Iyer", "Nair", "Banerjee",
  "Gupta", "Das", "Rao", "Verma", "Saxena", "Pillai", "Mishra", "Choudhary", "Menon", "Agarwal",
];

const DEPARTMENTS = ["Technology", "Finance", "Operations", "Marketing", "Human Resources", "Sales", "Design", "Analytics", "Legal", "Quality"];
const GRADES = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5", "Level 6", "Level 7", "Level 8"];
const CITIES: { city: string; state: string }[] = [
  { city: "Bangalore", state: "KARNATAKA" }, { city: "Mumbai", state: "MAHARASHTRA" },
  { city: "Delhi", state: "DELHI" }, { city: "Chennai", state: "TAMIL NADU" },
  { city: "Hyderabad", state: "TELANGANA" }, { city: "Pune", state: "MAHARASHTRA" },
  { city: "Kolkata", state: "WEST BENGAL" }, { city: "Gurugram", state: "HARYANA" },
  { city: "Ahmedabad", state: "GUJARAT" }, { city: "Jaipur", state: "RAJASTHAN" },
];
const INCOME_BANDS = ["800000", "1200000", "1500000", "1800000", "2200000", "2600000", "3000000"];

const INDIAN_BANKS: { name: string; ifscPrefix: string }[] = [
  { name: "State Bank of India", ifscPrefix: "SBIN" },
  { name: "HDFC Bank", ifscPrefix: "HDFC" },
  { name: "ICICI Bank", ifscPrefix: "ICIC" },
  { name: "Axis Bank", ifscPrefix: "UTIB" },
  { name: "Kotak Mahindra Bank", ifscPrefix: "KKBK" },
  { name: "Punjab National Bank", ifscPrefix: "PUNB" },
  { name: "Bank of Baroda", ifscPrefix: "BARB" },
  { name: "Canara Bank", ifscPrefix: "CNRB" },
  { name: "IndusInd Bank", ifscPrefix: "INDB" },
  { name: "Yes Bank", ifscPrefix: "YESB" },
];

export const SEED_CORPORATES = ["Chola Business Services", "SCONE", "First Corp"] as const;
const EMPLOYEES_PER_CORPORATE = 155;

function randomChoice<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function seededId(corpIndex: number, i: number): string {
  const prefix = ["CBS", "SCN", "FCR"][corpIndex];
  return `${prefix}-${240000 + corpIndex * 1000 + (i + 1)}`;
}

export interface SeedEmployee {
  id: string;
  name: string;
  phone: string;
  email: string;
  journey: "ntb" | "etb" | "etb-nk" | "ntb-no-parents";
  dob: string;
  pan: string;
  fatherName: string;
  motherName: string;
  currentAddress: string;
  income: string;
  dateOfJoining: string;
  employmentType: string;
  gender: string;
  designation: string;
  department: string;
  grade: string;
  costCenter: string;
  jobLocationCity: string;
  employmentStatus: string;
  companyName: string;
  jobLocationPincode?: string;
  state?: string;
  /** Indian bank account details (from HRMS) for disbursal */
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankBranch?: string;
}

export function getSeedEmployees(): SeedEmployee[] {
  const out: SeedEmployee[] = [];
  for (let c = 0; c < SEED_CORPORATES.length; c++) {
    const companyName = SEED_CORPORATES[c];
    for (let i = 0; i < EMPLOYEES_PER_CORPORATE; i++) {
      const seed = c * 1000 + i;
      const firstName = randomChoice(FIRST_NAMES, seed);
      const lastName = randomChoice(LAST_NAMES, seed + 1);
      const name = `${firstName} ${lastName}`;
      const id = seededId(c, i);
      const phone = `9${String(700000000 + (seed % 300000000)).slice(0, 9)}`;
      const dept = randomChoice(DEPARTMENTS, seed + 2);
      const grade = randomChoice(GRADES, seed + 3);
      const cityState = randomChoice(CITIES, seed + 4);
      const city = cityState.city;
      const state = cityState.state;
      const income = randomChoice(INCOME_BANDS, seed + 5);
      const dojYear = 2020 + (seed % 5);
      const dojMonth = (seed % 12) + 1;
      const dojDay = (seed % 28) + 1;
      const dateOfJoining = `${dojYear}-${String(dojMonth).padStart(2, "0")}-${String(dojDay).padStart(2, "0")}`;
      const birthYear = 1985 + (seed % 25);
      const dob = `${birthYear}-${String((seed % 12) + 1).padStart(2, "0")}-${String((seed % 28) + 1).padStart(2, "0")}`;
      out.push({
        id,
        name,
        phone,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, "")}.example`,
        journey: i % 4 === 0 ? "etb" : i % 4 === 1 ? "etb-nk" : "ntb",
        dob,
        pan: `${["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"][seed % 10]}${["B", "C", "D", "E", "F", "G", "H", "J", "K", "L"][(seed + 1) % 10]}${String(10000000 + (seed % 90000000))}${["F", "G", "H", "J", "K", "L", "M", "N", "P", "Q"][(seed + 2) % 10]}`,
        fatherName: `Father of ${firstName}`,
        motherName: `Mother of ${firstName}`,
        currentAddress: `Block ${(seed % 50) + 1}, ${city} ${500000 + (seed % 100000)}`,
        income,
        dateOfJoining,
        employmentType: "Permanent",
        gender: i % 2 === 0 ? "Male" : "Female",
        designation: `${dept} Role`,
        department: dept,
        grade,
        costCenter: `${dept.slice(0, 3)}-${city.slice(0, 3)}`,
        jobLocationCity: city,
        employmentStatus: i % 20 === 0 ? "Inactive" : "Active",
        companyName,
        jobLocationPincode: String(500000 + (seed % 100000)),
        state,
        ...((): { bankName: string; bankAccountNumber: string; bankIfscCode: string; bankBranch: string } => {
          const bank = randomChoice(INDIAN_BANKS, seed + 10);
          return {
            bankName: bank.name,
            bankAccountNumber: String(1000000000 + (seed % 9000000000)),
            bankIfscCode: `${bank.ifscPrefix}0${String(100000 + (seed % 900000)).padStart(6, "0")}`,
            bankBranch: `${city} Branch`,
          };
        })(),
      });
    }
  }
  return out;
}
