"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import type { Pet } from "@/types";

interface OnboardingFlowProps {
  onComplete: () => void;
}

type Step = "choice" | "create" | "join" | "personalise";

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user } = useUser();
  const [step, setStep] = useState<Step>("choice");
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [memberCount, setMemberCount] = useState(1);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addPet = () => {
    setPets([...pets, { type: "dog", size: "medium", count: 1 }]);
  };

  const updatePet = (
    index: number,
    field: keyof Pet,
    value: string | number
  ) => {
    const updated = [...pets];
    updated[index] = { ...updated[index], [field]: value };
    setPets(updated);
  };

  const removePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  const createHousehold = async () => {
    if (!user || !householdName.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Create household
      const { data: household, error: householdError } = await supabase
        .from("households")
        .insert({
          name: householdName,
          member_count: memberCount,
          pets: pets,
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Create or update user
      const { error: userError } = await supabase.from("users").upsert({
        clerk_id: user.id,
        name: user.fullName || user.firstName || "User",
        avatar_url: user.imageUrl,
        household_id: household.id,
      });

      if (userError) throw userError;

      onComplete();
    } catch (err) {
      console.error(err);
      setError("Failed to create household. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinHousehold = async () => {
    if (!user || !inviteCode.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Find household by invite code
      const { data: household, error: findError } = await supabase
        .from("households")
        .select()
        .eq("invite_code", inviteCode.toUpperCase())
        .single();

      if (findError || !household) {
        setError("Invalid invite code. Please check and try again.");
        return;
      }

      // Create or update user
      const { error: userError } = await supabase.from("users").upsert({
        clerk_id: user.id,
        name: user.fullName || user.firstName || "User",
        avatar_url: user.imageUrl,
        household_id: household.id,
      });

      if (userError) throw userError;

      // Update member count
      await supabase
        .from("households")
        .update({ member_count: household.member_count + 1 })
        .eq("id", household.id);

      onComplete();
    } catch (err) {
      console.error(err);
      setError("Failed to join household. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-lg py-12">
      {/* Step: Choice */}
      {step === "choice" && (
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold">Welcome to Polish! 🏠</h2>
          <p className="mb-8 text-slate-400">
            Let&apos;s get your household set up
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setStep("create")}
              className="glass-card w-full p-6 text-left transition-transform hover:scale-[1.02]"
            >
              <div className="mb-2 text-2xl">🏡</div>
              <h3 className="mb-1 text-xl font-semibold">Create a Household</h3>
              <p className="text-sm text-slate-400">
                Start fresh and invite your family
              </p>
            </button>

            <button
              onClick={() => setStep("join")}
              className="glass-card w-full p-6 text-left transition-transform hover:scale-[1.02]"
            >
              <div className="mb-2 text-2xl">🔗</div>
              <h3 className="mb-1 text-xl font-semibold">Join a Household</h3>
              <p className="text-sm text-slate-400">I have an invite code</p>
            </button>
          </div>
        </div>
      )}

      {/* Step: Create */}
      {step === "create" && (
        <div className="animate-slide-up">
          <button
            onClick={() => setStep("choice")}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            ← Back
          </button>

          <h2 className="mb-6 text-2xl font-bold">Create Your Household</h2>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Household Name
              </label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g., The Smiths"
                className="input-field w-full"
              />
            </div>

            <button
              onClick={() => setStep("personalise")}
              disabled={!householdName.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step: Personalise */}
      {step === "personalise" && (
        <div className="animate-slide-up">
          <button
            onClick={() => setStep("create")}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            ← Back
          </button>

          <h2 className="mb-2 text-2xl font-bold">
            Personalise Your Household
          </h2>
          <p className="mb-6 text-slate-400">
            This helps us suggest cleaning frequencies
          </p>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                How many people live here?
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMemberCount(Math.max(1, memberCount - 1))}
                  className="btn-secondary h-12 w-12 text-xl"
                >
                  -
                </button>
                <span className="w-12 text-center text-2xl font-bold">
                  {memberCount}
                </span>
                <button
                  onClick={() => setMemberCount(memberCount + 1)}
                  className="btn-secondary h-12 w-12 text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Any pets? 🐾
                </label>
                <button
                  onClick={addPet}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  + Add pet
                </button>
              </div>

              {pets.length === 0 ? (
                <p className="text-sm text-slate-500">No pets added</p>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet, index) => (
                    <div
                      key={index}
                      className="glass-card flex items-center gap-3 p-4"
                    >
                      <select
                        value={pet.type}
                        onChange={(e) =>
                          updatePet(
                            index,
                            "type",
                            e.target.value as Pet["type"]
                          )
                        }
                        className="input-field flex-1"
                      >
                        <option value="dog">🐕 Dog</option>
                        <option value="cat">🐈 Cat</option>
                        <option value="other">🐾 Other</option>
                      </select>

                      <select
                        value={pet.size}
                        onChange={(e) =>
                          updatePet(
                            index,
                            "size",
                            e.target.value as Pet["size"]
                          )
                        }
                        className="input-field flex-1"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={pet.count}
                        onChange={(e) =>
                          updatePet(
                            index,
                            "count",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="input-field w-16 text-center"
                      />

                      <button
                        onClick={() => removePet(index)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={createHousehold}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Household"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Join */}
      {step === "join" && (
        <div className="animate-slide-up">
          <button
            onClick={() => setStep("choice")}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white"
          >
            ← Back
          </button>

          <h2 className="mb-6 text-2xl font-bold">Join a Household</h2>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Enter Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
                className="input-field w-full text-center text-2xl tracking-widest uppercase"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              onClick={joinHousehold}
              disabled={loading || inviteCode.length < 6}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Household"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
