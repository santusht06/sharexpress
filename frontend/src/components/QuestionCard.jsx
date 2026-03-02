import React, { memo } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QuestionCard = memo(({ data, isOpen, onToggle }) => {
  return (
    <div className="border-b border-white/10 px-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-6 text-left  "
      >
        <span className="text-white text-lg ">{data.question}</span>

        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0 ml-4"
        >
          <Plus className="text-white" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.3, ease: "easeInOut" },
            }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-6 text-[#B8B8B8]  ">{data.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default QuestionCard;
