import React, { useState } from "react";
import QuestionCard from "./QuestionCard";

const Questions = () => {
  const faqData = [
    {
      id: 1,
      question: "How does ShareXpress work?",
      answer:
        "ShareXpress creates isolated sharing sessions between devices. Files are uploaded securely and accessed through permission-controlled, time-limited sessions.",
    },
    {
      id: 2,
      question: "Do I need an account to share files?",
      answer:
        "No. Guest mode allows instant file sharing without registration. Creating an account unlocks advanced features like persistent sessions and editing control.",
    },
    {
      id: 3,
      question: "Are my files stored permanently?",
      answer:
        "No. Files automatically expire based on session policies unless you're using registered storage options.",
    },
    {
      id: 4,
      question: "How secure are file transfers?",
      answer:
        "All transfers use signed URLs, session isolation, and strict API-level permission enforcement to prevent unauthorized access.",
    },
    {
      id: 5,
      question: "What is Single Editor Lock?",
      answer:
        "Single Editor Lock ensures that only one authorized user can edit a file at a time, preventing conflicts and maintaining data integrity.",
    },
    {
      id: 6,
      question: "Can I control who downloads or edits files?",
      answer:
        "Yes. ShareXpress uses a granular permission engine that allows role-based control over viewing, downloading, editing, and deleting.",
    },
    {
      id: 7,
      question: "Is there a file size limit?",
      answer:
        "File limits depend on the session configuration. Guest sessions have controlled limits, while registered users may access extended quotas.",
    },
    {
      id: 8,
      question: "Does ShareXpress support real-time updates?",
      answer:
        "Yes. Registered sessions can leverage real-time updates for editing locks and session state changes.",
    },
  ];

  const [activeId, setActiveId] = useState(null);

  return (
    <section className="w-full min-h-screen py-32 flex flex-col items-center gap-16">
      {/* Heading */}
      <div className="max-w-md text-center">
        <h1 className="text-white text-[48px] font-[500] leading-[1.1]">
          Questions
        </h1>
        <p className="text-[#B8B8B8] mt-3">
          Everything you need to know about Sharexpress.
        </p>
      </div>

      {/* FAQ List */}
      <div className="w-full max-w-3xl">
        {faqData.map((item) => (
          <QuestionCard
            key={item.id}
            data={item}
            isOpen={activeId === item.id}
            onToggle={() => setActiveId(activeId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default Questions;
