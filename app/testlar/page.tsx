"use client";

import { useEffect, useState } from "react";
import { HelpCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BottomTab from "@/components/BottomTab";

type Test = {
  id: string;
  slug: string;
  title: string;
  question_count: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
};

export default function TestlarPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchTests() {
      const { data } = await supabase.from("tests").select("*");
      setTests(data || []);
    }
    fetchTests();
  }, []);

  async function openTest(test: Test) {
    const { data } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", test.id);
    setQuestions(data || []);
    setActiveTest(test);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  function answer(index: number) {
    if (selected !== null) return;
    setSelected(index);
    if (index === questions[current]?.correct_index) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 700);
  }

  if (activeTest) {
    if (finished) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-2xl font-bold">Test tugadi!</h1>
          <p className="text-textSecondary">
            Natija: {score} / {questions.length}
          </p>
          <button
            onClick={() => setActiveTest(null)}
            className="mt-4 rounded-xl2 bg-accent px-6 py-3 font-display font-semibold text-bg"
          >
            Testlarga qaytish
          </button>
        </div>
      );
    }

    const q = questions[current];
    if (!q) {
      return (
        <div className="flex min-h-screen items-center justify-center text-textSecondary">
          Bu testda savollar hali qo'shilmagan.
        </div>
      );
    }

    return (
      <div className="min-h-screen px-5 pt-8">
        <div className="mx-auto max-w-md">
          <p className="text-sm text-textSecondary">
            Savol {current + 1} / {questions.length}
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold">
            {q.question}
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct_index;
              const isSelected = i === selected;
              let style = "border-white/10 bg-surface text-textPrimary";
              if (selected !== null && isCorrect) {
                style = "border-success bg-success/10 text-success";
              } else if (selected !== null && isSelected && !isCorrect) {
                style = "border-danger bg-danger/10 text-danger";
              }
              return (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className={`rounded-xl2 border p-4 text-left transition-colors ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="font-display text-2xl font-bold">Testlar</h1>
        <div className="mt-5 flex flex-col gap-3">
          {tests.map((t) => (
            <button
              key={t.id}
              onClick={() => openTest(t)}
              className="flex items-center justify-between rounded-xl2 bg-surface p-4 text-left shadow-card active:bg-surfaceHover"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-purple-500/15 text-purple-400">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-textSecondary">
                    {t.question_count} ta savol
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-textSecondary" />
            </button>
          ))}
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
