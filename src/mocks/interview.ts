import { demoStore } from "@/lib/demo";
// Curated, original seed content for the Interview demo. Counts are a dated snapshot, shown with their date in the UI.
export const snapshot = { date: "21 Nov 2026", companies: 48, questions: 6214, last30: 412 };

export type Company = { slug: string; name: string; color: string; group: string; questions: number; updated: string; blurb?: string; featured?: boolean };

export const companies: Company[] = [
  { slug: "flipkart", name: "Flipkart", color: "#2563EB", group: "Top Tech", questions: 412, updated: "2d ago", featured: true, blurb: "Build commerce for hundreds of millions of shoppers at festival-sale scale." },
  { slug: "swiggy", name: "Swiggy", color: "#F97316", group: "Top Tech", questions: 233, updated: "1wk ago" },
  { slug: "zomato", name: "Zomato", color: "#DC2626", group: "Top Tech", questions: 198, updated: "3d ago" },
  { slug: "meesho", name: "Meesho", color: "#DB2777", group: "Top Tech", questions: 121, updated: "5d ago" },
  { slug: "ola", name: "Ola", color: "#0F172A", group: "Top Tech", questions: 140, updated: "2wk ago" },
  { slug: "razorpay", name: "Razorpay", color: "#1D4ED8", group: "Fintech", questions: 176, updated: "1d ago", featured: true, blurb: "Payments infrastructure where correctness and latency both matter." },
  { slug: "phonepe", name: "PhonePe", color: "#7C3AED", group: "Fintech", questions: 167, updated: "5d ago" },
  { slug: "zerodha", name: "Zerodha", color: "#0EA5E9", group: "Fintech", questions: 92, updated: "3wk ago" },
  { slug: "cred", name: "CRED", color: "#111827", group: "Fintech", questions: 88, updated: "1wk ago" },
  { slug: "groww", name: "Groww", color: "#16A34A", group: "Fintech", questions: 74, updated: "4d ago" },
  { slug: "freshworks", name: "Freshworks", color: "#22C55E", group: "High-Growth", questions: 109, updated: "6d ago" },
  { slug: "postman", name: "Postman", color: "#EA580C", group: "High-Growth", questions: 97, updated: "2d ago" },
  { slug: "browserstack", name: "BrowserStack", color: "#F59E0B", group: "High-Growth", questions: 83, updated: "1wk ago" },
  { slug: "zepto", name: "Zepto", color: "#9333EA", group: "High-Growth", questions: 79, updated: "3d ago" },
  { slug: "dream11", name: "Dream11", color: "#B91C1C", group: "High-Growth", questions: 66, updated: "2wk ago" },
  { slug: "atlan", name: "Atlan", color: "#4F46E5", group: "High-Growth", questions: 41, updated: "4wk ago" },
  { slug: "sarvam", name: "Sarvam AI", color: "#0D9488", group: "High-Growth", questions: 38, updated: "1wk ago" },
  { slug: "unacademy", name: "Unacademy", color: "#15803D", group: "High-Growth", questions: 57, updated: "3wk ago" },
];
export const groups = ["Top Tech", "Fintech", "High-Growth"];
export const getCompany = (slug: string) => companies.find((c) => c.slug === slug);

export type Lang = "python" | "javascript" | "java";
export const langLabel: Record<Lang, string> = { python: "Python", javascript: "JavaScript", java: "Java" };

export type Question = {
  id: string; title: string; topic: string; type: string; difficulty: "Easy" | "Medium" | "Hard";
  seniority: string; role: string; jobType: string; round: string; updated: string; locked: boolean;
  statement?: string; constraints?: string[]; examples?: { input: string; output: string; explanation: string }[];
  tips?: string[]; approach?: { title: string; body: string }[];
  starter?: Record<Lang, string>; solution?: Partial<Record<Lang, string>>;
  cases?: { input: Record<string, string>; expected: string; explanation: string }[];
};

const full: Omit<Question, "updated">[] = [
  {
    id: "q-first-unique", title: "First Non-Repeating Character in a Log Line", topic: "Coding", type: "Data Structures & Algorithms",
    difficulty: "Easy", seniority: "Entry Level", role: "Software Engineer", jobType: "Full-time", round: "Phone Screen", locked: false,
    statement: "Given a string s of lowercase letters, return the index of the first character that appears exactly once. If every character repeats, return -1.",
    constraints: ["1 <= s.length <= 100,000", "s contains only lowercase English letters", "Aim for O(n) time"],
    examples: [
      { input: 's = "swiss"', output: "1", explanation: "'w' at index 1 is the first character that appears once." },
      { input: 's = "aabb"', output: "-1", explanation: "Every character repeats." },
    ],
    tips: ["What they are testing: whether you reach for a frequency count instead of nested loops.", "Common mistake: returning the character instead of its index."],
    approach: [
      { title: "Count every character", body: "One pass over s, storing how often each letter appears in a dictionary or a 26-slot array." },
      { title: "Scan again in order", body: "Walk s from the start and return the first index whose count is 1." },
      { title: "Handle the no-answer case", body: "If the scan finishes without a hit, return -1." },
    ],
    starter: {
      python: "class Solution:\n    def firstUnique(self, s: str) -> int:\n        # Write your code here\n        pass\n",
      javascript: "/**\n * @param {string} s\n * @return {number}\n */\nfunction firstUnique(s) {\n  // Write your code here\n}\n",
      java: "class Solution {\n    public int firstUnique(String s) {\n        // Write your code here\n        return -1;\n    }\n}\n",
    },
    solution: {
      python: "from collections import Counter\n\nclass Solution:\n    def firstUnique(self, s: str) -> int:\n        counts = Counter(s)\n        for i, ch in enumerate(s):\n            if counts[ch] == 1:\n                return i\n        return -1\n",
      javascript: "function firstUnique(s) {\n  const counts = {};\n  for (const ch of s) counts[ch] = (counts[ch] || 0) + 1;\n  for (let i = 0; i < s.length; i++) if (counts[s[i]] === 1) return i;\n  return -1;\n}\n",
    },
    cases: [
      { input: { s: '"swiss"' }, expected: "1", explanation: "'w' is the first unique character." },
      { input: { s: '"aabb"' }, expected: "-1", explanation: "No character appears once." },
      { input: { s: '"z"' }, expected: "0", explanation: "A single character is unique." },
    ],
  },
  {
    id: "q-merge-slots", title: "Merge Overlapping Delivery Slots", topic: "Coding", type: "Data Structures & Algorithms",
    difficulty: "Medium", seniority: "Mid Level", role: "Software Engineer", jobType: "Full-time", round: "Onsite", locked: false,
    statement: "You are given a list of delivery slots as [start, end] minute pairs. Merge every pair of overlapping or touching slots and return the merged list sorted by start time.",
    constraints: ["1 <= slots.length <= 10,000", "0 <= start < end <= 1,440", "Slots may arrive in any order"],
    examples: [
      { input: "slots = [[60,90],[30,70],[200,240]]", output: "[[30,90],[200,240]]", explanation: "[30,70] overlaps [60,90]." },
      { input: "slots = [[10,20],[20,30]]", output: "[[10,30]]", explanation: "Touching slots merge too." },
    ],
    tips: ["What they are testing: sorting as a preprocessing step, then a single linear sweep.", "Common mistake: forgetting that touching ranges (end == next start) should merge."],
    approach: [
      { title: "Sort by start time", body: "Sorting guarantees any overlap is with the most recent merged slot." },
      { title: "Sweep and extend", body: "If the next slot starts at or before the current end, extend the end to the max of both." },
      { title: "Otherwise start a new slot", body: "Push the current slot and begin a new one." },
    ],
    starter: {
      python: "class Solution:\n    def mergeSlots(self, slots: list[list[int]]) -> list[list[int]]:\n        # Write your code here\n        pass\n",
      javascript: "/**\n * @param {number[][]} slots\n * @return {number[][]}\n */\nfunction mergeSlots(slots) {\n  // Write your code here\n}\n",
      java: "class Solution {\n    public int[][] mergeSlots(int[][] slots) {\n        // Write your code here\n        return new int[0][];\n    }\n}\n",
    },
    solution: {
      python: "class Solution:\n    def mergeSlots(self, slots):\n        slots.sort()\n        merged = [slots[0][:]]\n        for start, end in slots[1:]:\n            if start <= merged[-1][1]:\n                merged[-1][1] = max(merged[-1][1], end)\n            else:\n                merged.append([start, end])\n        return merged\n",
      javascript: "function mergeSlots(slots) {\n  slots.sort((a, b) => a[0] - b[0]);\n  const merged = [[...slots[0]]];\n  for (const [s, e] of slots.slice(1)) {\n    const last = merged[merged.length - 1];\n    if (s <= last[1]) last[1] = Math.max(last[1], e);\n    else merged.push([s, e]);\n  }\n  return merged;\n}\n",
    },
    cases: [
      { input: { slots: "[[60,90],[30,70],[200,240]]" }, expected: "[[30,90],[200,240]]", explanation: "Two slots overlap." },
      { input: { slots: "[[10,20],[20,30]]" }, expected: "[[10,30]]", explanation: "Touching slots merge." },
      { input: { slots: "[[5,6]]" }, expected: "[[5,6]]", explanation: "A single slot is unchanged." },
    ],
  },
  {
    id: "q-brackets", title: "Validate Bracket Sequences in a Config File", topic: "Coding", type: "Data Structures & Algorithms",
    difficulty: "Easy", seniority: "Entry Level", role: "Backend Engineer", jobType: "Full-time", round: "Phone Screen", locked: false,
    statement: "Given a string containing only the characters ()[]{}, return true if every opening bracket is closed by the same type of bracket in the correct order.",
    constraints: ["1 <= s.length <= 10,000", "s contains only ()[]{}"],
    examples: [
      { input: 's = "{[()]}"', output: "true", explanation: "Each bracket closes in order." },
      { input: 's = "([)]"', output: "false", explanation: "The square bracket closes before the round one." },
    ],
    tips: ["What they are testing: whether you recognise a stack problem quickly.", "Common mistake: not checking for leftover open brackets at the end."],
    approach: [
      { title: "Push openers", body: "Push every opening bracket onto a stack." },
      { title: "Match closers", body: "On a closing bracket, the stack top must be its matching opener; otherwise return false." },
      { title: "Check the stack is empty", body: "Any leftover opener means the sequence is invalid." },
    ],
    starter: {
      python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        pass\n",
      javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Write your code here\n}\n",
      java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}\n",
    },
    solution: {
      python: "class Solution:\n    def isValid(self, s: str) -> bool:\n        pairs = {')': '(', ']': '[', '}': '{'}\n        stack = []\n        for ch in s:\n            if ch in pairs:\n                if not stack or stack.pop() != pairs[ch]:\n                    return False\n            else:\n                stack.append(ch)\n        return not stack\n",
      javascript: "function isValid(s) {\n  const pairs = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const ch of s) {\n    if (pairs[ch]) { if (stack.pop() !== pairs[ch]) return false; }\n    else stack.push(ch);\n  }\n  return stack.length === 0;\n}\n",
    },
    cases: [
      { input: { s: '"{[()]}"' }, expected: "true", explanation: "Properly nested." },
      { input: { s: '"([)]"' }, expected: "false", explanation: "Wrong closing order." },
      { input: { s: '"(("' }, expected: "false", explanation: "Unclosed brackets remain." },
    ],
  },
  {
    id: "q-top-terms", title: "Top-K Frequent Search Terms", topic: "Coding", type: "Data Structures & Algorithms",
    difficulty: "Medium", seniority: "Senior Level", role: "Software Engineer", jobType: "Full-time", round: "Onsite", locked: false,
    statement: "Given a list of search terms and an integer k, return the k most frequent terms. Break ties alphabetically.",
    constraints: ["1 <= terms.length <= 50,000", "1 <= k <= number of distinct terms", "Terms are lowercase words"],
    examples: [
      { input: 'terms = ["shoes","bag","shoes","cap","bag","shoes"], k = 2', output: '["shoes","bag"]', explanation: "shoes appears 3 times, bag 2." },
    ],
    tips: ["What they are testing: counting plus a custom sort or a bounded heap.", "Common mistake: ignoring the alphabetical tie-break."],
    approach: [
      { title: "Count terms", body: "Build a frequency map in one pass." },
      { title: "Order by (-count, term)", body: "Sort distinct terms by descending count, then alphabetically." },
      { title: "Take the first k", body: "For very large inputs, a size-k heap keeps memory bounded." },
    ],
    starter: {
      python: "class Solution:\n    def topTerms(self, terms: list[str], k: int) -> list[str]:\n        # Write your code here\n        pass\n",
      javascript: "/**\n * @param {string[]} terms\n * @param {number} k\n * @return {string[]}\n */\nfunction topTerms(terms, k) {\n  // Write your code here\n}\n",
      java: "class Solution {\n    public List<String> topTerms(String[] terms, int k) {\n        // Write your code here\n        return new ArrayList<>();\n    }\n}\n",
    },
    solution: {
      python: "from collections import Counter\n\nclass Solution:\n    def topTerms(self, terms, k):\n        counts = Counter(terms)\n        return sorted(counts, key=lambda t: (-counts[t], t))[:k]\n",
      javascript: "function topTerms(terms, k) {\n  const counts = new Map();\n  for (const t of terms) counts.set(t, (counts.get(t) || 0) + 1);\n  return [...counts.keys()]\n    .sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b))\n    .slice(0, k);\n}\n",
    },
    cases: [
      { input: { terms: '["shoes","bag","shoes","cap","bag","shoes"]', k: "2" }, expected: '["shoes","bag"]', explanation: "Highest counts first." },
      { input: { terms: '["b","a"]', k: "2" }, expected: '["a","b"]', explanation: "Tie broken alphabetically." },
      { input: { terms: '["x"]', k: "1" }, expected: '["x"]', explanation: "Single term." },
    ],
  },
];

const lockedShapes = [
  { topic: "Behavioral & Experience", type: "Culture & Leadership", seniority: "Mid Level", role: "Engineering Manager", round: "Phone Screen" },
  { topic: "Coding", type: "Data Structures & Algorithms", seniority: "Senior Level", role: "Software Engineer", round: "Onsite" },
  { topic: "System Design", type: "Distributed Systems", seniority: "Senior Level", role: "Backend Engineer", round: "Onsite" },
  { topic: "Coding", type: "Data Structures & Algorithms", seniority: "Entry Level", role: "Data Engineer", round: "Phone Screen" },
  { topic: "Behavioral & Experience", type: "Past Project Deep-Dive", seniority: "Mid Level", role: "Software Engineer", round: "Onsite" },
  { topic: "Coding", type: "SQL", seniority: "Entry Level", role: "Data Analyst", round: "Phone Screen" },
];

// Every company gets 2 readable samples (rotated from the pool) plus locked placeholders with no real content.
export function questionsFor(slug: string): Question[] {
  const i = Math.max(0, companies.findIndex((c) => c.slug === slug));
  const free = [full[i % full.length], full[(i + 1) % full.length]].map((q) => ({ ...q, updated: "2d ago" }));
  const locked = lockedShapes.map((s, k) => ({
    ...s, id: `${slug}-locked-${k}`, title: "Locked question", difficulty: "Medium" as const,
    jobType: "Full-time", updated: `${(k + 1) * 9}d ago`, locked: true,
  }));
  return [...free, ...locked];
}

export const ticker = companies.slice(0, 8).map((c, k) => `${c.name} · ${["Coding", "System Design", "Behavioral"][k % 3]} · ${k + 1}d ago`);

export type Status = "Not Started" | "In Progress";
const STATUS_KEY = "cm-practice-status";
export const readStatus = (): Record<string, Status> => {
  try { return JSON.parse(demoStore.getItem(STATUS_KEY) || "{}"); } catch { return {}; }
};
export const setStatus = (id: string, s: Status) => demoStore.setItem(STATUS_KEY, JSON.stringify({ ...readStatus(), [id]: s }));
