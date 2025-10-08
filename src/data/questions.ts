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
    question: "¿El malware es un software malicioso diseñado para dañar sistemas?",
    options: [
      "1. VERDADERO - Diseñado para dañar o acceder sin autorización",
      "2. FALSO - Ayuda a que los equipos funcionen más rápido"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q2",
    question: "¿Un virus es un tipo común de malware?",
    options: [
      "1. FALSO - Es una herramienta de seguridad",
      "2. VERDADERO - Se replica y se propaga a otros equipos"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q3",
    question: "¿Los troyanos se disfrazan como software legítimo?",
    options: [
      "1. VERDADERO - Parecen legítimos pero contienen código malicioso",
      "2. FALSO - Son dispositivos de seguridad físicos"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q4",
    question: "¿El ransomware cifra archivos y exige pago?",
    options: [
      "1. FALSO - Acelera el equipo",
      "2. VERDADERO - Cifra archivos y exige pago para descifrado"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q5",
    question: "¿El phishing es un ataque de ingeniería social para robar información?",
    options: [
      "1. VERDADERO - Engaña a las víctimas para revelar información sensible",
      "2. FALSO - Es un método para atrapar peces"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q6",
    question: "¿Un botnet es una red de computadoras infectadas?",
    options: [
      "1. VERDADERO - Red controlada por ciberdelincuentes",
      "2. FALSO - Es una red social"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q7",
    question: "¿El spyware monitorea secretamente la actividad del usuario?",
    options: [
      "1. FALSO - Protege contra virus",
      "2. VERDADERO - Recopila información de los usuarios en secreto"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q8",
    question: "¿Los archivos .exe son comúnmente usados por malware en Windows?",
    options: [
      "1. VERDADERO - Los ejecutables pueden contener malware",
      "2. FALSO - Los .txt son más peligrosos"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q9",
    question: "¿Los keyloggers registran las pulsaciones de teclas para robar contraseñas?",
    options: [
      "1. VERDADERO - Registran teclas para robar información",
      "2. FALSO - Ayudan a iniciar sesión más rápido"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q10",
    question: "¿Mantener el software actualizado ayuda a protegerse contra malware?",
    options: [
      "1. VERDADERO - Las actualizaciones y antivirus protegen",
      "2. FALSO - Las actualizaciones hacen los sistemas más vulnerables"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q11",
    question: "¿Los gusanos informáticos se propagan automáticamente sin interacción del usuario?",
    options: [
      "1. VERDADERO - Se replican y propagan automáticamente",
      "2. FALSO - Necesitan permiso del usuario"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q12",
    question: "¿El adware muestra anuncios no deseados?",
    options: [
      "1. VERDADERO - Muestra anuncios y rastrea hábitos de navegación",
      "2. FALSO - Bloquea todos los anuncios"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q13",
    question: "¿Las vulnerabilidades 'zero-day' aprovechan fallos conocidos?",
    options: [
      "1. FALSO - Aprovechan fallos desconocidos",
      "2. VERDADERO - Solo funcionan en sistemas parchados"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q14",
    question: "¿Los ataques SQL injection apuntan a bases de datos?",
    options: [
      "1. VERDADERO - Manipulan consultas en bases de datos",
      "2. FALSO - Solo afectan navegadores web"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q15",
    question: "¿Los ataques DDoS saturan los servidores con tráfico?",
    options: [
      "1. FALSO - Roban datos de servidores",
      "2. VERDADERO - Inundan servidores para hacerlos inaccesibles"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  // Preguntas avanzadas Security+ level
  {
    id: "q16",
    question: "¿Un keylogger hardware puede ser detectado fácilmente por software antivirus?",
    options: [
      "1. VERDADERO - La mayoría de antivirus modernos lo detectan",
      "2. FALSO - Al ser hardware, pasa desapercibido para el antivirus"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q17",
    question: "¿El malware polimórfico cambia su código para evadir detección?",
    options: [
      "1. VERDADERO - Modifica su firma constantemente",
      "2. FALSO - Mantiene el mismo código siempre"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q18",
    question: "¿El malware 'logic bomb' se activa inmediatamente al infectar el sistema?",
    options: [
      "1. FALSO - Se activa solo al cumplirse una condición",
      "2. VERDADERO - Siempre se ejecuta al instante"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q19",
    question: "¿Un RAT (Remote Access Trojan) permite control remoto completo?",
    options: [
      "1. FALSO - Solo roba archivos",
      "2. VERDADERO - Permite monitoreo y comandos remotos"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q20",
    question: "¿Los ataques 'watering hole' se dirigen a usuarios específicos?",
    options: [
      "1. VERDADERO - Infectan sitios web que los objetivos visitan",
      "2. FALSO - Se realizan masivamente"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q21",
    question: "¿El malware 'bootkit' infecta solo la memoria RAM?",
    options: [
      "1. FALSO - Infecta el registro de arranque o MBR",
      "2. VERDADERO - Solo trabaja en memoria"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q22",
    question: "¿Un rootkit de usuario tiene más privilegios que un rootkit de kernel?",
    options: [
      "1. VERDADERO - Siempre tiene más acceso que el de kernel",
      "2. FALSO - El rootkit de kernel tiene privilegios más altos"
    ],
    correctAnswer: 1,
    explanation: ""
  },
  {
    id: "q23",
    question: "¿El spyware siempre requiere interacción del usuario para instalarse?",
    options: [
      "1. FALSO - Algunos se instalan automáticamente",
      "2. VERDADERO - Siempre necesita interacción"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q24",
    question: "¿Un exploit 'DLL hijacking' permite ejecutar código malicioso reemplazando DLL legítimas?",
    options: [
      "1. VERDADERO - Reemplaza DLL para ejecutar malware",
      "2. FALSO - Solo causa fallos de programa"
    ],
    correctAnswer: 0,
    explanation: ""
  },
  {
    id: "q25",
    question: "¿El malware 'cryptojacking' siempre ralentiza visiblemente la computadora?",
    options: [
      "1. FALSO - Puede operar en segundo plano sin afectar rendimiento",
      "2. VERDADERO - Siempre hace que el sistema se vuelva lento"
    ],
    correctAnswer: 0,
    explanation: ""
  }
];

