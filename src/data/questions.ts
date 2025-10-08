export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const malwareQuestions: Question[] = [
  {
    id: "q1",
    question: "Malware is malicious software designed to damage systems?",
    options: [
      "1. FALSE - Helps computers run faster",
      "2. TRUE - Designed to damage or gain unauthorized access"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q2",
    question: "A virus is a common type of malware?",
    options: [
      "1. FALSE - It's a security tool",
      "2. TRUE - Replicates and spreads to other computers"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q3",
    question: "Trojan horses disguise themselves as legitimate software?",
    options: [
      "1. FALSE - They are physical security devices",
      "2. TRUE - Appear legitimate but contain malicious code"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q4",
    question: "Ransomware encrypts files and demands payment?",
    options: [
      "1. FALSE - It speeds up your computer",
      "2. TRUE - Encrypts files and demands payment for decryption"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q5",
    question: "Phishing is a social engineering attack to steal information?",
    options: [
      "1. FALSE - It's a method to catch fish",
      "2. TRUE - Tricks victims into revealing sensitive information"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q6",
    question: "A botnet is a network of infected computers?",
    options: [
      "1. FALSE - It's a social media network",
      "2. TRUE - Network controlled by cybercriminals"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q7",
    question: "Spyware secretly monitors user activity?",
    options: [
      "1. FALSE - It protects from viruses",
      "2. TRUE - Secretly collects information about users"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q8",
    question: ".exe files are commonly used by malware on Windows?",
    options: [
      "1. FALSE - .txt files are more dangerous",
      "2. TRUE - Executable programs can contain malware"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q9",
    question: "Keyloggers record keystrokes to steal passwords?",
    options: [
      "1. FALSE - They help log into websites faster",
      "2. TRUE - Record keystrokes to steal sensitive data"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q10",
    question: "Keeping software updated helps protect against malware?",
    options: [
      "1. FALSE - Updates make systems more vulnerable",
      "2. TRUE - Updates and antivirus provide protection"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q11",
    question: "Computer worms spread across networks without user interaction?",
    options: [
      "1. FALSE - They need user permission to spread",
      "2. TRUE - Self-replicating malware that spreads automatically"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q12",
    question: "Adware displays unwanted advertisements?",
    options: [
      "1. FALSE - It blocks all advertisements",
      "2. TRUE - Shows unwanted ads and tracks browsing habits"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q13",
    question: "Zero-day exploits target known vulnerabilities?",
    options: [
      "1. FALSE - They target unknown vulnerabilities",
      "2. TRUE - They only work on patched systems"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q14",
    question: "SQL injection attacks target databases?",
    options: [
      "1. FALSE - They only affect web browsers",
      "2. TRUE - Manipulate database queries through input fields"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q15",
    question: "DDoS attacks overwhelm servers with traffic?",
    options: [
      "1. FALSE - They steal data from servers",
      "2. TRUE - Flood servers to make them unavailable"
    ],
    correctAnswer: 1,
    explanation: ""
  }
];