import { pool, db } from "./index";
import { complaints, moderators, ComplaintCategory, ComplaintStatus } from "./schema";
import { hashPassword } from "../security/auth";
import { generateCaseNumber } from "../security/token";

interface SeedComplaint {
  title: string;
  description: string;
  category: ComplaintCategory;
  authorName?: string;
  isAnonymous: boolean;
  status: ComplaintStatus;
  verdict?: string;
  verdictBy?: string;
  verdictDate?: Date;
  upvotesCount: number;
  downvotesCount: number;
  score: number;
}

const SEED_CASES: SeedComplaint[] = [
  {
    title: "Mosquito spawn rate remains unpatched after 300 million years of user feedback",
    description:
      "The planetary dev team introduced mosquitoes during the Jurassic era as an alleged biomass redistributor. They contribute zero positive gameplay value, emit high-frequency auditory harassment during sleep cycles, and transmit severe debuffs. Please deprecate the species or nerf spawn rates in suburban biomes.",
    category: "FLORA_FAUNA",
    authorName: "SummerCampSurvivor_88",
    isAnonymous: false,
    status: "UNDER_INVESTIGATION",
    verdict:
      "The Ministry of Entomological Balancing has reviewed the grievance. Mosquitoes are currently tied to legacy food-web dependencies in the wetland sub-mesh. Removing them causes cascading crash errors in the Amphibian Runtime. An update reducing spawn frequency by 14% is scheduled for Patch 2027.3.",
    verdictBy: "Chief Ecosphere Arbiter Vane",
    verdictDate: new Date("2026-03-14T10:30:00Z"),
    upvotesCount: 1420,
    downvotesCount: 18,
    score: 1402,
  },
  {
    title: "Lower back structural warranty expires after only 25-30 planetary revolutions",
    description:
      "Bipedal locomotion was rolled out as a flagship feature, but spinal column lumbar vertebrae L4-L5 fail under minimal load after barely a third of expected unit lifespan. Sitting in standard institutional chairs induces chronic structural degradation. Requesting urgent patch to upgrade spinal cartilage to carbon polymer.",
    category: "HUMAN_BIOLOGY",
    authorName: "Citizen_DeskJockey",
    isAnonymous: false,
    status: "RESOLVED",
    verdict:
      "Bipedalism was pushed to production early due to competitive pressure from quadrupeds. The warranty disclaimer in Genesis Terms of Service Section 4.B clearly specifies that warranty void occurs upon sedentary posture exceeding 6 consecutive hours. Posture adjustment ergonomic exercises authorized as temporary mitigation.",
    verdictBy: "High Commissary for Biomechanical Integrity",
    verdictDate: new Date("2026-05-02T14:15:00Z"),
    upvotesCount: 2315,
    downvotesCount: 42,
    score: 2273,
  },
  {
    title: "Oceans occupy 71% of surface area but water payload is contaminated with sodium chloride",
    description:
      "Planetary resources screen lists trillions of liters of water, yet attempting to hydrate from the primary liquid reservoir causes cellular dehydration, organ failure, and madness. Why render vast water biomes if base biological units cannot consume them without costly desalination infrastructure?",
    category: "PLANETARY_INFRASTRUCTURE",
    authorName: undefined,
    isAnonymous: true,
    status: "CANONIZED",
    verdict:
      "Salt was added as a planetary anti-freeze and microbial preservative to prevent the global hydrosphere from corrupting into gelatinous goo. Drinking directly from the ocean is considered unauthorized cheat access. Working as designed.",
    verdictBy: "Planetary Hydrology Oversight Committee",
    verdictDate: new Date("2026-01-19T09:00:00Z"),
    upvotesCount: 3104,
    downvotesCount: 89,
    score: 3015,
  },
  {
    title: "Mondays dilate subjective temporal flow by approximately 350% compared to weekends",
    description:
      "Atomic clocks claim 24 equal hours per rotation, but monitoring neural perception proves that hours between 09:00 and 17:00 on Monday run at 0.25x engine speed, whereas Saturday evening elapses instantaneously. This is blatant clock cycle throttling.",
    category: "TEMPORAL_MECHANICS",
    authorName: "ChronosSkeptic",
    isAnonymous: false,
    status: "UNDER_INVESTIGATION",
    verdict:
      "Temporal Relativity Wardens have installed tachyon dampeners in the workplace corridor. Investigation revealed server load throttling occurs when 4 billion conscious entities simultaneously desire to be elsewhere.",
    verdictBy: "Senior Warden of Standard Chronometry",
    verdictDate: new Date("2026-06-11T16:45:00Z"),
    upvotesCount: 1892,
    downvotesCount: 31,
    score: 1861,
  },
  {
    title: "Toast butter-side down probability violates standard fair coin-toss physics",
    description:
      "Independent testing of dropped breakfast toast reveals an 89.4% ground-impact rate on the buttered face. This indicates an intentional malicious gravitational bias designed to ruin morning morale and carpet hygiene.",
    category: "PHYSICS_GRAVITY",
    authorName: "BreakfastTheoreticalPhysicist",
    isAnonymous: false,
    status: "RESOLVED",
    verdict:
      "Not a physics bug. Table height (approx. 76 cm) combined with standard Earth gravitational constant G (9.81 m/s²) provides exactly sufficient rotational velocity for a 180-degree flip before floor contact. Citizens are advised to lower tables to floor level or consume untoasted dry wafers.",
    verdictBy: "Gravitational Mechanics Bureau",
    verdictDate: new Date("2026-04-18T11:20:00Z"),
    upvotesCount: 974,
    downvotesCount: 45,
    score: 929,
  },
  {
    title: "Excessive humidity render lag and unoptimized sweat gland cooling algorithm",
    description:
      "In tropical coordinates during summer cycles, humidity exceeds 85%. At this saturation, the evaporative cooling mechanic of human sweat completely stalls, yet the sweat generation daemon continues pumping fluid at maximum capacity, resulting in drenched attire and zero thermal relief.",
    category: "ATMOSPHERE_WEATHER",
    authorName: undefined,
    isAnonymous: true,
    status: "PENDING_REVIEW",
    upvotesCount: 652,
    downvotesCount: 12,
    score: 640,
  },
  {
    title: "Teeth require constant daily manual maintenance or will literally rot out of user's skull",
    description:
      "Sharks regrow dental arrays indefinitely throughout their lifecycle. Rodents enjoy continuous incisor extrusion. Humans get two sets: one disposable set during childhood tutorial, and one fragile set that erodes from eating naturally occurring sugars. Why is the human dental asset so poorly engineered?",
    category: "HUMAN_BIOLOGY",
    authorName: "OrthodonticRefugee",
    isAnonymous: false,
    status: "UNDER_INVESTIGATION",
    verdict:
      "Docket forwarded to Evolutionary Optimization Board. A proposal to allow humans to molt teeth every 12 years was rejected due to aesthetic horror in focus groups. Re-evaluating mineral fortification protocols.",
    verdictBy: "Crown Bureau of Somatic Architecture",
    verdictDate: new Date("2026-07-22T08:30:00Z"),
    upvotesCount: 1540,
    downvotesCount: 22,
    score: 1518,
  },
  {
    title: "Sleep mechanic requires 33% total runtime downtime with no skip button or fast-forward",
    description:
      "Conscious human units must spend roughly 8 out of every 24 hours unconscious, paralyzed in horizontal mode, hallucinating nonsensical low-budget storylines (dreams), while predators or alarms remain active. Furthermore, difficulty sleeping is triggered simply by worrying about sleeping.",
    category: "EXISTENTIAL_METAGAME",
    authorName: "NocturnalInsomniac",
    isAnonymous: false,
    status: "PENDING_REVIEW",
    upvotesCount: 2190,
    downvotesCount: 54,
    score: 2136,
  },
];

export async function seedDatabase() {
  if (!db) {
    console.error("❌ Cannot seed database: DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log("🏛️ Initiating Earth Mods planetary database seed...");

  try {
    // 1. Ensure initial administrator exists
    const adminUsername = process.env.INITIAL_ADMIN_USERNAME || "archon_prime";
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "directorate@earthmods.internal";
    const adminPassword =
      process.env.INITIAL_ADMIN_PASSWORD || "EarthModsPlanetaryModerator2026!";
    const hashedPassword = await hashPassword(adminPassword);

    await db
      .insert(moderators)
      .values({
        username: adminUsername,
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
        isActive: true,
      })
      .onConflictDoNothing();

    console.log(`✅ Verified/Seeded planetary administrator account: ${adminUsername}`);

    // 2. Seed complaints
    for (const item of SEED_CASES) {
      const caseNumber = generateCaseNumber();
      await db
        .insert(complaints)
        .values({
          caseNumber,
          title: item.title,
          description: item.description,
          category: item.category,
          authorName: item.authorName || null,
          isAnonymous: item.isAnonymous,
          status: item.status,
          verdict: item.verdict || null,
          verdictBy: item.verdictBy || null,
          verdictDate: item.verdictDate || null,
          upvotesCount: item.upvotesCount,
          downvotesCount: item.downvotesCount,
          score: item.score,
        })
        .onConflictDoNothing();
      console.log(`   - Seeded Case: [${caseNumber}] ${item.title.substring(0, 45)}...`);
    }

    console.log("✨ Earth Mods seed sequence completed successfully.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    throw err;
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
