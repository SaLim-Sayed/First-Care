// import React
import axios from "axios";
import { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";

// import Component
import { Button } from "@heroui/react";
import { useTranslation } from "react-i18next";
import List from "./Prediction/List";
import Predict from "./Prediction/Predict";

// Custom Tailwind Modal Component
const CustomModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[var(--card-bg)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--border-color)] overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--card-bg)] sticky top-0 z-10">
          <h3 className="text-xl font-bold text-[var(--text-main)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end bg-[var(--card-bg)] sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-[#0076f7] hover:bg-[#0060cc] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
          >
            {title === 'نتائج الفحص الذكي' || title === 'Smart Diagnosis Results' ? (title === 'نتائج الفحص الذكي' ? 'إغلاق' : 'Close') : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const onOpenChange = (open) => setIsOpen(open !== undefined ? open : !isOpen);
  return { isOpen, onOpen, onClose, onOpenChange };
}

function Main({ match }) {
  const { t, i18n } = useTranslation();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const [keys] = useState({
    skin: [
      "dichromic _patches",
      "nodal_skin_eruptions",
      "skin_rash",
      "itching",
      "scaly skin",
      "redness",
      "blisters",
      "yellowish_skin",
      "family_history",
      "sweating",
      "red_spots_over_body",
      "swelled_lymph_nodes",
      "raised pink or red bumps",
      "crusts and scabs",
      "small fluid-filled blisters",
      "swollen glands",
      "toxic_look_(typhos)",
      "history_of_alcohol_consumption",
      "night sweats",
      "cold sweat",
      "bruising",
      "veins that are dark purple or blue",
      "itching around one or more of the veins",
      "changes in skin color around a varicose vein",
      "dry skin",
      "skin thinning",
      "pale skin",
      "blackheads",
      "pus_filled_pimples",
      "whiteheads",
      "large, solid, painful lumps under the skin",
      "small red, tender bumps",
      "spots, silver_like_dusting",
      "skin_peeling",
      "small scaling spots",
      "dry, cracked skin that may bleed or itch",
      "yellow_crust_ooze",
      "spiderlike blood vessels on your skin",
      "redness in the palms of the hands",
      "hives",
      "lumps under the skin",
      "spider angiomas",
      "easily bleeding",
      "itchy skin",
      "yellow discoloration in the skin and eyes (jaundice)",
      "sweating abnormalities",
    ],
    stomach: [
      "acidity",
      "stomach_pain",
      "vomiting",
      "abdominal_pain",
      "indigestion",
      "stomach_internal_itching",
      "passage_of_gases",
      "heartburn",
      "diarrhea",
      "stomach cramps and pain",
      "constipation",
      "swollen glands",
      "persistent vomiting",
      "belly_pain",
      "stomach_bleeding",
      "distention_of_abdomen",
      "fluid_overload",
      "history_of_alcohol_consumption",
      "swelling_of_stomach",
      "pain_during_bowel_movements",
      "feeling bloated after eating",
      "feeling full after eating small amounts of food",
      "fluid accumulation in your abdomen (ascites)",
      "regurgitating food or saliva",
      "belching",
      "fluid retention",
      "abdominal discomfort",
      "an enlarged liver",
      "difficulty digesting food",
      "abdominal swelling",
      "upper abdominal pain",
      "increased thirst",
      "abdominal pain",
      "acute_liver_failure",
      "heartburn or abdominal pain",
    ],
    nose: [
      "continuous_sneezing",
      "loss_of_smell",
      "runny_nose",
      "sinus_pressure",
      "stuffy nose",
      "irritation_in_anus",
      "red_sore_around_nose",
      "sneezing",
      "frequent nosebleeds",
      "severe nosebleeds",
    ],
    eyes: [
      "yellowing_of_eyes",
      "blurred_and_distorted_vision",
      "sunken_eyes",
      "family_history",
      "visual_disturbances",
      "pain_behind_the_eyes",
      "redness_of_eyes",
      "whites of the eyes",
      "sluggish pupil reaction",
      "watery eyes",
      "closed eyes",
      "puffy_eyes",
      "yellow discoloration in the skin and eyes (jaundice)",
    ],
    heart: [
      "irregular heartbeat",
      "rapid pulse",
      "weak pulse",
      "a rapid, weak pulse",
    ],
    chest: [
      "chest_pain",
      "cough",
      "breathlessness",
      "family_history",
      "chest discomfort",
      "rapid breathing",
      "coughing for three or more weeks",
      "coughing up blood",
      "pain with breathing or coughing",
      "pressure, tightness, pain, or a squeezing or aching sensation in your chest or arms that may spread to your neck, jaw or back",
      "shortness of breath",
      "a new cough that does not go away",
      "coughing up blood",
      "severe shortness of breath",
      "chest pain that comes and goes",
      "coughing at night",
      "pneumonia",
      "wheezing when exhaling",
      "irregular breathing",
      "difficulty breathing",
      "difficult or rapid breathing",
      "wheezing",
    ],
    "throat and neck": [
      "difficulty swallowing",
      "sensation of a lump in your throat",
      "patches_in_throat",
      "swollen lymph glands, mainly on the neck",
      "dehydration",
      "changes to your voice",
      "pain in your neck and throat",
      "swollen lymph nodes in your neck",
      "congestion",
      "throat_irritation",
      "pressure, tightness, pain, or a squeezing or aching sensation in your chest or arms that may spread to your neck, jaw or back",
      "enlarged_thyroid",
      "hoarseness",
      "slurred_speech",
      "red tonsils",
      "swollen tonsils",
      "a hoarse or muffled voice",
      "pain in the throat",
      "a scratchy sensation in the throat",
      "inability to swallow",
      "sore throat",
      "scratchy throat",
      "shortness of breath",
      "increasing hoarseness",
      "sore throat and painful mouth sores",
    ],
    activity: [
      "nausea",
      "extra_marital_contacts",
      "fatigue",
      "irregular_sugar_level",
      "lethargy",
      "restlessness",
      "slow-healing sores",
      "family_history",
      "dizziness",
      "lack_of_concentration",
      "loss_of_balance",
      "depression",
      "irritability",
      "frequent yawning",
      "mood changes",
      "difficulty walking",
      "weakness_of_one_body_side",
      "involuntary spasms or twitches",
      "general feeling of discomfort",
      "malaise",
      "tiredness",
      "coma",
      "sudden dizziness",
      "nervousness",
      "anxiety",
      "difficulty sleeping",
      "seizures",
      "painful_walking",
      "loss of flexibility",
      "movement_stiffness",
      "decreased range of motion",
      "spinning_movements",
      "unsteadiness",
      "loss of balance",
      "sudden numbness or weakness in the face, arm, or leg, especially on one side of the body",
      "body aches",
      "lightheadedness",
      "coma in severe case",
      "frequent infections",
      "trouble sleeping",
      "fainting",
      "exercise intolerance",
      "chronic fatigue",
      "weakness",
      "a drop in blood pressure",
      "receiving_blood_transfusion",
      "receiving_unsterile_injections",
      "tenderness",
    ],
    "weight and appetite": [
      "loss_of_appetite",
      "excessive_hunger",
      "obesity",
      "family_history",
      "weight_gain",
      "losing weight",
      "unintentional weight loss",
      "increased appetite",
      "weight_loss",
    ],
    "muscles and joints": [
      "swelling_joints",
      "muscle_wasting",
      "muscle aches and joint pain",
      "occasional muscle aches",
      "stiff_neck",
      "back_pain",
      "neck_pain",
      "weakness_in_limbs",
      "tingling in your arms",
      "numbness and weakness in your arms, hands, legs or feet",
      "stiffness",
      "muscle weakness",
      "muscle_pain",
      "joint_pain",
      "pressure, tightness, pain, or a squeezing or aching sensation in your chest or arms that may spread to your neck, jaw or back",
      "muscle aches, tenderness and stiffness",
      "hip_joint_pain",
      "knee_pain",
      "bone spurs",
      "warm red skin over the affected joint",
      "inflammation in and around the joints",
      "swollen and stiff joints",
      "bone pain",
      "achy and swollen joints",
    ],
    urination: [
      "burning_micturition",
      "spotting_ urination",
      "polyuria",
      "dark_urine",
      "blood in your urine",
      "yellow_urine",
      "bladder_discomfort",
      "continuous_feel_of_urine",
      "foul_smell_of urine",
      "strong, persistent urge to urinate",
      "passing frequent, small amounts of urine",
      "urine that appears cloudy",
      "urine that appears red, bright pink or cola-colored, a sign of blood in the urine",
      "decreased urine output",
      "urinary problems",
      "frequent urination",
      "presence of ketones in the urine",
    ],
    fever: ["high_fever", "low-grade fever", "mild_fever", "fever"],
    extremities: [
      "brittle_nails",
      "cold_hands_and_feets",
      "inflammatory_nails",
      "small_dents_in_nails",
      "thickened, pitted or ridged nails",
      "swelling in your feet",
      "swelling in your ankles (edema)",
      "severe pain_in_hand",
      "obvious deformity_in_hand",
      "numbness in your hand and fingers",
      "no response of limbs",
      "prominent_veins_on_calf",
      "swollen_blood_vessels_in_legs",
      "swollen_legs",
      "an achy or heavy feeling in the legs",
      "worsened pain after sitting or standing for a long time",
      "nausea",
      "swelling in your legs",
      "swelling",
    ],
    "mental issues": [
      "loss of consciousness",
      "confusion or changes in mental awareness",
      "impaired memory",
      "confusion",
      "disorientation",
      "difficulty with coordination",
      "memory loss",
      "difficulty finding words",
      "difficulty with planning",
      "difficulty with organizing",
      "difficulty with visual and spatial abilities",
      "trouble speaking",
      "trouble understanding",
      "trouble walking",
      "problems seeing",
      "inability to recognize",
      "depressed brainstem reflexes",
      "lack_of_concentration",
      "loss_of_balance",
    ],
    "head and face": [
      "headache",
      "thinning hair",
      "fine, brittle hair",
      "drying_and_tingling_lips",
      "tingling or numbness of the lips, tongue or cheek",
      "facial swelling",
      "ear pain",
      "puffy_face",
    ],
    "private parts": [
      "bloody_stool",
      "pain_in_anal_region",
      "abnormal_menstruation",
      "loss of menstrual periods",
      "sexual difficulties",
      "pale stool color",
    ],
    senstitvity: [
      "chills",
      "shivering",
      "altered_sensorium",
      "shaking chills",
      "increased sensitivity to cold",
      "grating sensation",
      "anaphylaxis",
      "no response to painful stimuli",
      "no response of limbs",
      "cramps",
    ],
    mouth: [
      "ulcers_on_tongue",
      "mucoid_sputum",
      "production of mucus",
      "blood_in_sputum",
      "phlegm",
      "rusty_sputum",
      "bleeding from the gums",
      "sore throat and painful mouth sores",
    ],
  });

  const [posts, setPosts] = useState({
    "a drop in blood pressure": 0,
    "a hoarse or muffled voice": 0,
    "a new cough that does not go away": 0,
    "a rapid, weak pulse": 0,
    "a scratchy sensation in the throat": 0,
    "abdominal discomfort": 0,
    "abdominal pain": 0,
    "abdominal swelling": 0,
    abdominal_pain: 0,
    abnormal_menstruation: 0,
    "achy and swollen joints": 0,
    acidity: 0,
    acute_liver_failure: 0,
    altered_sensorium: 0,
    "an achy or heavy feeling in the legs": 0,
    "an enlarged liver": 0,
    anaphylaxis: 0,
    anxiety: 0,
    back_pain: 0,
    belching: 0,
    belly_pain: 0,
    blackheads: 0,
    bladder_discomfort: 0,
    "bleeding from the gums": 0,
    blisters: 0,
    "blood in your urine": 0,
    blood_in_sputum: 0,
    bloody_stool: 0,
    blurred_and_distorted_vision: 0,
    "body aches": 0,
    "bone pain": 0,
    "bone spurs": 0,
    breathlessness: 0,
    brittle_nails: 0,
    bruising: 0,
    burning_micturition: 0,
    "changes in skin color around a varicose vein": 0,
    "changes to your voice": 0,
    "chest discomfort": 0,
    "chest pain that comes and goes": 0,
    chest_pain: 0,
    chills: 0,
    "chronic fatigue": 0,
    "closed eyes": 0,
    "cold sweat": 0,
    cold_hands_and_feets: 0,
    coma: 0,
    "coma in severe case": 0,
    confusion: 0,
    "confusion or changes in mental awareness": 0,
    congestion: 0,
    constipation: 0,
    continuous_feel_of_urine: 0,
    continuous_sneezing: 0,
    cough: 0,
    "coughing at night": 0,
    "coughing for three or more weeks": 0,
    "coughing up blood": 0,
    cramps: 0,
    "crusts and scabs": 0,
    dark_urine: 0,
    "decreased range of motion": 0,
    "decreased urine output": 0,
    dehydration: 0,
    "depressed brainstem reflexes": 0,
    depression: 0,
    diarrhea: 0,
    "dichromic _patches": 0,
    "difficult or rapid breathing": 0,
    "difficulty breathing": 0,
    "difficulty digesting food": 0,
    "difficulty finding words": 0,
    "difficulty sleeping": 0,
    "difficulty swallowing": 0,
    "difficulty walking": 0,
    "difficulty with coordination": 0,
    "difficulty with organizing": 0,
    "difficulty with planning": 0,
    "difficulty with visual and spatial abilities": 0,
    disorientation: 0,
    distention_of_abdomen: 0,
    dizziness: 0,
    "dry skin": 0,
    "dry, cracked skin that may bleed or itch": 0,
    drying_and_tingling_lips: 0,
    "ear pain": 0,
    "easily bleeding": 0,
    enlarged_thyroid: 0,
    excessive_hunger: 0,
    "exercise intolerance": 0,
    extra_marital_contacts: 0,
    "facial swelling": 0,
    fainting: 0,
    family_history: 0,
    fatigue: 0,
    "feeling bloated after eating": 0,
    "feeling full after eating small amounts of food": 0,
    fever: 0,
    "fine, brittle hair": 0,
    "fluid accumulation in your abdomen (ascites)": 0,
    "fluid retention": 0,
    fluid_overload: 0,
    "foul_smell_of urine": 0,
    "frequent infections": 0,
    "frequent nosebleeds": 0,
    "frequent urination": 0,
    "frequent yawning": 0,
    "general feeling of discomfort": 0,
    "grating sensation": 0,
    headache: 0,
    heartburn: 0,
    "heartburn or abdominal pain": 0,
    high_fever: 0,
    hip_joint_pain: 0,
    history_of_alcohol_consumption: 0,
    hives: 0,
    hoarseness: 0,
    "impaired memory": 0,
    "inability to recognize": 0,
    "inability to swallow": 0,
    "increased appetite": 0,
    "increased sensitivity to cold": 0,
    "increased thirst": 0,
    "increasing hoarseness": 0,
    indigestion: 0,
    "inflammation in and around the joints": 0,
    inflammatory_nails: 0,
    "involuntary spasms or twitches": 0,
    "irregular breathing": 0,
    "irregular heartbeat": 0,
    irregular_sugar_level: 0,
    irritability: 0,
    irritation_in_anus: 0,
    itching: 0,
    "itching around one or more of the veins": 0,
    "itchy skin": 0,
    joint_pain: 0,
    knee_pain: 0,
    lack_of_concentration: 0,
    "large, solid, painful lumps under the skin": 0,
    lethargy: 0,
    lightheadedness: 0,
    "losing weight": 0,
    "loss of balance": 0,
    "loss of consciousness": 0,
    "loss of flexibility": 0,
    "loss of menstrual periods": 0,
    loss_of_appetite: 0,
    loss_of_balance: 0,
    loss_of_smell: 0,
    "low-grade fever": 0,
    "lumps under the skin": 0,
    malaise: 0,
    "memory loss": 0,
    mild_fever: 0,
    "mood changes": 0,
    movement_stiffness: 0,
    mucoid_sputum: 0,
    "muscle aches and joint pain": 0,
    "muscle aches, tenderness and stiffness": 0,
    "muscle weakness": 0,
    muscle_pain: 0,
    muscle_wasting: 0,
    nausea: 0,
    neck_pain: 0,
    nervousness: 0,
    "night sweats": 0,
    "no response of limbs": 0,
    "no response to painful stimuli": 0,
    nodal_skin_eruptions: 0,
    "numbness and weakness in your arms, hands, legs or feet": 0,
    "numbness in your hand and fingers": 0,
    obesity: 0,
    "obvious deformity_in_hand": 0,
    "occasional muscle aches": 0,
    "pain in the throat": 0,
    "pain in your neck and throat": 0,
    "pain with breathing or coughing": 0,
    pain_behind_the_eyes: 0,
    pain_during_bowel_movements: 0,
    pain_in_anal_region: 0,
    painful_walking: 0,
    "pale skin": 0,
    "pale stool color": 0,
    passage_of_gases: 0,
    "passing frequent, small amounts of urine": 0,
    patches_in_throat: 0,
    "persistent vomiting": 0,
    phlegm: 0,
    pneumonia: 0,
    polyuria: 0,
    "presence of ketones in the urine": 0,
    "pressure, tightness, pain, or a squeezing or aching sensation in your chest or arms that may spread to your neck, jaw or back": 0,
    "problems seeing": 0,
    "production of mucus": 0,
    prominent_veins_on_calf: 0,
    puffy_eyes: 0,
    puffy_face: 0,
    pus_filled_pimples: 0,
    "raised pink or red bumps": 0,
    "rapid breathing": 0,
    "rapid pulse": 0,
    receiving_blood_transfusion: 0,
    receiving_unsterile_injections: 0,
    "red tonsils": 0,
    red_sore_around_nose: 0,
    red_spots_over_body: 0,
    redness: 0,
    "redness in the palms of the hands": 0,
    redness_of_eyes: 0,
    "regurgitating food or saliva": 0,
    restlessness: 0,
    runny_nose: 0,
    rusty_sputum: 0,
    "scaly skin": 0,
    "scratchy throat": 0,
    seizures: 0,
    "sensation of a lump in your throat": 0,
    "severe nosebleeds": 0,
    "severe pain_in_hand": 0,
    "severe shortness of breath": 0,
    "sexual difficulties": 0,
    "shaking chills": 0,
    shivering: 0,
    "shortness of breath": 0,
    sinus_pressure: 0,
    "skin redness": 0,
    "skin thinning": 0,
    skin_peeling: 0,
    skin_rash: 0,
    "slow-healing sores": 0,
    "sluggish pupil reaction": 0,
    slurred_speech: 0,
    "small fluid-filled blisters": 0,
    "small red, tender bumps": 0,
    "small scaling spots": 0,
    small_dents_in_nails: 0,
    sneezing: 0,
    "sore throat": 0,
    "sore throat and painful mouth sores": 0,
    "spider angiomas": 0,
    "spiderlike blood vessels on your skin": 0,
    spinning_movements: 0,
    "spots, silver_like_dusting": 0,
    "spotting_ urination": 0,
    stiff_neck: 0,
    stiffness: 0,
    "stomach cramps and pain": 0,
    stomach_bleeding: 0,
    stomach_internal_itching: 0,
    stomach_pain: 0,
    "strong, persistent urge to urinate": 0,
    "stuffy nose": 0,
    "sudden dizziness": 0,
    "sudden numbness or weakness in the face, arm, or leg, especially on one side of the body": 0,
    sunken_eyes: 0,
    sweating: 0,
    "sweating abnormalities": 0,
    swelled_lymph_nodes: 0,
    swelling: 0,
    "swelling in your ankles (edema)": 0,
    "swelling in your feet": 0,
    "swelling in your legs": 0,
    swelling_joints: 0,
    swelling_of_stomach: 0,
    "swollen and stiff joints": 0,
    "swollen glands": 0,
    "swollen lymph glands, mainly on the neck": 0,
    "swollen lymph nodes in your neck": 0,
    "swollen tonsils": 0,
    swollen_blood_vessels_in_legs: 0,
    swollen_legs: 0,
    tenderness: 0,
    "thickened, pitted or ridged nails": 0,
    "thinning hair": 0,
    throat_irritation: 0,
    "tingling in your arms": 0,
    "tingling or numbness of the lips, tongue or cheek": 0,
    tiredness: 0,
    "toxic_look_(typhos)": 0,
    "trouble sleeping": 0,
    "trouble speaking": 0,
    "trouble understanding": 0,
    "trouble walking": 0,
    ulcers_on_tongue: 0,
    "unintentional weight loss": 0,
    unsteadiness: 0,
    "upper abdominal pain": 0,
    "urinary problems": 0,
    "urine that appears cloudy": 0,
    "urine that appears red, bright pink or cola-colored, a sign of blood in the urine": 0,
    "veins that are dark purple or blue": 0,
    visual_disturbances: 0,
    vomiting: 0,
    "warm red skin over the affected joint": 0,
    "watery eyes": 0,
    "weak pulse": 0,
    weakness: 0,
    weakness_in_limbs: 0,
    weakness_of_one_body_side: 0,
    weight_gain: 0,
    weight_loss: 0,
    wheezing: 0,
    "wheezing when exhaling": 0,
    whiteheads: 0,
    "whites of the eyes": 0,
    "worsened pain after sitting or standing for a long time": 0,
    "yellow discoloration in the skin and eyes (jaundice)": 0,
    yellow_crust_ooze: 0,
    yellow_urine: 0,
    yellowing_of_eyes: 0,
    yellowish_skin: 0,
  });


  const [keysAr] = useState({
    "الجلد": [
      "بقع ثنائية اللون",
      "ثورات الجلد العقدي",
      "الطفح الجلدي",
      "متلهف، متشوق",
      "الجلد المتقشر",
      "احمرار الجلد",
      " وجود بثور",
      "جلد مصفر",
      "تاريخ العائلة",
      "التعرق",
      "بقع حمراء فوق الجسم",
      "تورم الغدد الليمفاوية",
      "بقع مرتفعة باللون الوردي أو الأحمر",
      "القشور وجرب",
      "بثور صغيرة مملوءة بالسوائل",
      "تورم الغدد",
      "التعرض للسم (حمى النمشية)",
      "تاريخ استهلاك الكحول",
      "تعرق ليلي",
      "عرق بارد",
      "وجود كدمات",
      "الأوردة ذات اللون الأرجواني الداكن أو الأزرق",
      "حكة حول واحد أو أكثر من الأوردة",
      "تغيرات في لون الجلد حول الدوالي",
      "جلد جاف",
      "ترقق الجلد",
      "جلد شاحب",
      " وجود رؤوس سوداء",
      "كثرة البثور",
      "الرؤوس البيضاء",
      "كتل كبيرة وصلبة ومؤلمة تحت الجلد",
      "نتوءات حمراء صغيرة مؤلمة",
      "البقع ، الفضة مثل الغبار",
      "تقشير الجلد",
      "بقع تحجيم صغيرة",
      "الجلد الجاف المتشقق الذي قد ينزف أو يسبب الحكة",
      "ناز القشرة الصفراء",
      "الأوعية الدموية الشبيهة بالعنكبوت على بشرتك",
      "احمرار في راحة اليدين",
      "قشعريرة",
      "كتل تحت الجلد",
      "الأورام الوعائية العنكبوتية",
      "ينزف بسهولة",
      "حكة في الجلد",
      "اصفرار الجلد والعينين (اليرقان).",
      " فرط التعرق",
    ],
    "المعدة": [
      "الشعور بحموضه في المعده",
      "آلام المعدة",
      "التقيؤ",
      "وجع في البطن",
      "عسر الهضم",
      "حكة داخلية في المعدة",
      "مرور الغازات",
      "حرقة من المعدة",
      "إسهال",
      "تقلصات وآلام في المعدة",
      "إمساك",
      "تورم الغدد",
      "القيء المستمر",
      "آلام البطن",
      "نزيف في المعدة",
      "انتفاخ البطن",
      "السوائل الزائدة",
      "تاريخ استهلاك الكحول",
      "تضخم في المعدة",
      "ألم أثناء حركات الأمعاء",
      "الشعور بالانتفاخ بعد الأكل",
      "الشعور بالشبع بعد تناول كميات قليلة من الطعام",
      "تراكم السوائل في البطن (الاستسقاء).",
      "تجدد الطعام أو اللعاب",
      "التجشؤ",
      "احتباس السوائل",
      "عدم ارتياح في البطن",
      "تضخم الكبد",
      "صعوبة في هضم الطعام",
      "انتفاخ البطن",
      "آلام في الجزء العلوي من البطن",
      "زيادة العطش",
      "وجع في البطن",
      "فشل حاد في الكبد",
      "حرقة في المعدة أو آلام في البطن",
    ],
    "الأنف": [
      "العطس المستمر",
      "فقدان حاسة الشم",
      "سيلان الأنف",
      "ضغط الجيوب الأنفية",
      "انسداد الأنف",
      "تهيج في الشرج",
      "قرحة حمراء حول الأنف",
      "العطس",
      "نزيف أنفي متكرر",
      "نزيف في الأنف الشديد",
    ],
    "عيون": [
      "اصفرار العيون",
      "رؤية مشوشة ومشوهة",
      "العيون الغارقة",
      "تاريخ العائلة",
      "اضطرابات بصرية",
      "ألم وراء العيون",
      "احمرار العيون",
      "بياض العيون",
      "رد  الفعل  البطيء (مع التحديق)",
      "عيون دامعة",
      "عيون مغلقة",
      "عيون منتفخة",
      "اصفرار الجلد والعينين (اليرقان).",
    ],
    "القلب": [
      "عدم انتظام ضربات القلب",
      "سرعة النبض",
      "نبض ضعيف",
      "نبضات القلب سريعه او ضعيفه",
    ],
    "الصدر": [
      "ألم صدر",
      "سعال",
      "ضيق التنفس",
      "تاريخ العائلة",
      "عدم الراحة في الصدر",
      "تنفس سريع",
      "السعال لمدة ثلاثة أسابيع أو أكثر",
      "سعال مصحوب بدم",
      "ألم مع التنفس أو السعال",
      "الضغط أو الضيق أو الألم أو الإحساس بالضغط أو التألم في صدرك أو ذراعيك قد ينتشر إلى رقبتك أو فكك أو ظهره",
      "ضيق في التنفس",
      "سعال جديد ولا يزول",
      "سعال مصحوب بدم",
      "ضيق شديد في التنفس",
      "ألم في الصدر يأتي ويذهب",
      "السعال في الليل",
      "التهاب رئوي",
      "الصفير عند الزفير",
      "التنفس غير المنتظم",
      "صعوبة في التنفس",
      "صعوبة التنفس أو سرعة التنفس",
      "التنفس مع صوت صفير أو قعقعة في الصدر.",
    ],
    "الحلق والرقبة": [
      "صعوبة في بلع الطعام",
      "الإحساس بقطعة في حلقك",
      "بقع في الحلق",
      "انتفاخ الغدد الليمفاوية ، وخاصة على الرقبة",
      "جفاف",
      "تغييرات على صوتك",
      "ألم في رقبتك وحلقك",
      "تورم الغدد الليمفاوية في رقبتك",
      "احتقان",
      "تهيج الحلق",
      "الضغط أو الضيق أو الألم أو الإحساس بالضغط أو التألم في صدرك أو ذراعيك قد ينتشر إلى رقبتك أو فكك أو ظهره",
      "تضخم الغدة الدرقية",
      "بحة في الصوت",
      "كلام غير واضح",
      "اللوزتين الحمراء",
      "تورم اللوزتين",
      "صوت أجش أو مكتوم",
      "ألم في الحلق",
      "إحساس بالحكة في الحلق",
      "عدم القدرة على البلع",
      "إلتهاب الحلق",
      "تنخم الحلق",
      "ضيق في التنفس",
      "زيادة بحة الصوت",
      "التهاب الحلق وتقرحات الفم المؤلمة",
    ],
    "النشاط": [
      "غثيان",
      "علاقات زوجية اضافية",
      "إعياء",
      "مستوى السكر غير المنتظم",
      "الخمول",
      "الأرق",
      "القروح بطيئة الشفاء",
      "تاريخ العائلة",
      "دوخة",
      "قلة التركيز",
      "فقدان التوازن",
      "الشعور بالاكتئاب",
      "التهيج",
      "التثاؤب المتكرر",
      "تغيرات في المزاج",
      "صعوبة في المشي",
      "ضعف جانب واحد من الجسم",
      "تشنجات أو تشنجات لا إرادية",
      "الشعور العام بعدم الراحة",
      "توعك",
      "الإرهاق",
      "غيبوبه",
      "دوار مفاجئ(دوخة)",
      "العصبية",
      "الشعور بالقلق",
      "صعوبة في النوم",
      "النوبات",
      "المشي المؤلم",
      "فقدان المرونة",
      "تصلب الحركة",
      "انخفاض نطاق الحركة",
      "حركات دورانية",
      "عدم الثبات",
      "فقدان التوازن",
      "خدر أو ضعف مفاجئ في الوجه أو الذراع أو الساق ، خاصة في جانب واحد من الجسم",
      "آلام في الجسم",
      "دوار",
      "غيبوبة متكرره",
      "التهابات متكررة",
      "مشكلة في النوم",
      "إغماء",
      "ممارسة التعصب",
      "التعب المزمن",
      "ضعف",
      "انخفاض في ضغط الدم",
      "تلقي نقل الدم",
      "استلام الحقن غير اليومية",
      "الليونة",
    ],
    "الوزن والشهية": [
      "فقدان الشهية",
      "الجوع المفرط",
      "بدانة",
      "تاريخ العائلة",
      "زيادة الوزن",
      "خسارة الوزن",
      "فقدان الوزن غير المقصود",
      "زيادة الشهية",
      "فقدان الوزن",
    ],
    "العضلات والمفاصل": [
      "تورم المفاصل",
      "هزال العضلات",
      "آلام العضلات وآلام المفاصل",
      "آلام العضلات في بعض الأحيان",
      "تصلب الرقبة",
      "ألم في الظهر",
      "الم الرقبة",
      "ضعف في الأطراف",
      "تنميل في ذراعيك",
      "الخدر والضعف بين ذراعيك أو يديك أو ساقيك أو قدميك",
      "صلابة(تصلب)",
      "ضعف العضلات",
      "ألم عضلي",
      "الم المفاصل",
      "الضغط أو الضيق أو الألم أو الإحساس بالضغط أو التألم في صدرك أو ذراعيك قد ينتشر إلى رقبتك أو فكك أو ظهره",
      "آلام العضلات والليونة والصلابة",
      "آلام مفصل الورك",
      "ألم الركبة",
      "نتوءات العظام",
      "جلد أحمر دافئ فوق المفصل المصاب",
      "التهاب في وحول المفاصل",
      "تورم وتصلب المفاصل",
      "آلام العظام",
      "المفاصل المؤلمة والمتورمة",
    ],
    "التبول": [
      "حرق اثناء التبول",
      "اكتشاف التبول",
      "فرط البول",
      "البول الداكن",
      "دم في البول",
      "البول الأصفر",
      "عدم الراحة في المثانة",
      "شعور مستمر بالتبول ",
      "رائحة كريهة من البول",
      "رغبة قوية ومستمرة في التبول",
      "تمرير كميات صغيرة متكررة من البول",
      "البول الذي يبدو غائما",
      "ظهور البول باللون الأحمر أو الوردي الفاتح أو بلون الكولا ، وهي علامة على وجود دم في البول",
      "انخفاض انتاج البول",
      "مشاكل المسالك البولية",
      "كثرة التبول",
      "وجود الكيتونات في البول",
    ],
    "الحمى": [
      "ارتفاع درجة الحرارة",
      "حمى منخفضة ",
      "حمى خفيفة",
      "حُمى",
    ],
    "الأطراف": [
      "أظافر هشة",
      "بروده الايد والاقدام",
      "المسامير الالتهابية",
      "خدوش صغيرة في الأظافر",
      "أظافر سميكة أو محفورة أو ممزقة",
      "تورم في قدميك",
      "تورم في الكاحلين (وذمة)",
      "ألم شديد في اليد",
      "تشوه واضح في اليد",
      "خدر في يدك وأصابعك",
      "لا استجابة للأطراف",
      "عروق بارزة على العجل",
      "تورم الأوعية الدموية في الساقين",
      "تورم الساقين",
      "شعور مؤلم أو ثقيل في الساقين",
      "تفاقم الألم بعد الجلوس أو الوقوف لفترة طويلة",
      "غثيان",
      "تورم في ساقيك",
      "تورم",
    ],
    "القضايا العقلية": [
      "فقدان الوعي",
      "ارتباك أو تغيرات في الوعي العقلي",
      "ضعف الذاكرة",
      "الشعور بالارتباك",
      "الارتباك",
      "صعوبة في التنسيق",
      "فقدان الذاكرة",
      "صعوبة في إيجاد الكلمات",
      "صعوبة التخطيط",
      "صعوبة في التنظيم",
      "صعوبة في القدرات البصرية والمكانية",
      "مشكلة في الكلام",
      "مشكلة في الفهم",
      "مشكلة في المشي",
      "مشاكل الرؤية",
      "عدم القدرة على التعرف",
      "ردود فعل في جذع الدماغ",
      "قلة التركيز",
      "فقدان التوازن",
    ],
    "الرأس والوجه": [
      "صداع الراس",
      "شعر خفيف",
      "شعر ناعم هش",
      "تجفيف وتنميل الشفاه",
      "تنميل أو خدر في الشفتين أو اللسان أو الخد",
      "تورم الوجه",
      "ألم الأذن",
      "وجه منتفخ ",
    ],
    "أجزاء خاصة": [
      "وجود دم في البراز",
      "ألم في منطقة الشرج",
      "طمث غير طبيعي",
      "فقدان الدورة الشهرية",
      "ضعف جنسي",
      "لون البراز شاحب",
    ],
    "الحس": [
      "قشعريرة",
      "رعشة (ارتجاف)",
      "تغيير الحسية",
      "تهتز قشعريرة",
      "زيادة الحساسية للبرد",
      "ضجة كبيرة",
      "الحساسية المفرطة",
      "لا استجابة للمنبهات المؤلمة",
      "لا استجابة للأطراف",
      "تشنجات",
    ],
    "الفم": [
      "القرحة على اللسان",
      "البلغم المخاطي",
      "إنتاج المخاط",
      "وجود دم في البصاق",
      "البلغم",
      "البلغم صدئ",
      "نزيف من اللثة",
      "التهاب الحلق وتقرحات الفم المؤلمة",
    ],
  });

  const [postsAr, setPostsAr] = useState([
    "انخفاض في ضغط الدم",
    "صوت أجش أو مكتوم",
    "سعال جديد ولا يزول",
    "نبضات القلب سريعه او ضعيفه",
    "إحساس بالحكة في الحلق",
    "عدم ارتياح في البطن",
    "وجع في البطن",
    "انتفاخ البطن",
    "وجع في البطن",
    "طمث غير طبيعي",
    "المفاصل المؤلمة والمتورمة",
    "الشعور بحموضه في المعده",
    "فشل حاد في الكبد",
    "تغيير الحسية",
    "شعور مؤلم أو ثقيل في الساقين",
    "تضخم الكبد",
    "الحساسية المفرطة",
    "الشعور بالقلق",
    "ألم في الظهر",
    "التجشؤ",
    "آلام البطن",
    " وجود رؤوس سوداء",
    "عدم الراحة في المثانة",
    "نزيف من اللثة",
    " وجود بثور",
    "دم في البول",
    "وجود دم في البصاق",
    "وجود دم في البراز",
    "رؤية مشوشة ومشوهة",
    "آلام في الجسم",
    "آلام العظام",
    "نتوءات العظام",
    "ضيق التنفس",
    "أظافر هشة",
    "وجود كدمات",
    "حرق اثناء التبول",
    "تغيرات في لون الجلد حول الدوالي",
    "تغييرات على صوتك",
    "عدم الراحة في الصدر",
    "ألم في الصدر يأتي ويذهب",
    "ألم صدر",
    "قشعريرة",
    "التعب المزمن",
    "عيون مغلقة",
    "عرق بارد",
    "بروده الايد والاقدام",
    "غيبوبه",
    "غيبوبة متكرره",
    "الشعور بالارتباك",
    "ارتباك أو تغيرات في الوعي العقلي",
    "احتقان",
    "إمساك",
    "شعور مستمر بالتبول ",
    "العطس المستمر",
    "سعال",
    "السعال في الليل",
    "السعال لمدة ثلاثة أسابيع أو أكثر",
    "سعال مصحوب بدم",
    "تشنجات",
    "القشور وجرب",
    "البول الداكن",
    "انخفاض نطاق الحركة",
    "انخفاض انتاج البول",
    "جفاف",
    "ردود فعل في جذع الدماغ",
    "الشعور بالاكتئاب",
    "إسهال",
    "بقع ثنائية اللون",
    "صعوبة التنفس أو سرعة التنفس",
    "صعوبة في التنفس",
    "صعوبة في هضم الطعام",
    "صعوبة في إيجاد الكلمات",
    "صعوبة في النوم",
    "صعوبة في بلع الطعام",
    "صعوبة في المشي",
    "صعوبة في التنسيق",
    "صعوبة في التنظيم",
    "صعوبة التخطيط",
    "صعوبة في القدرات البصرية والمكانية",
    "الارتباك",
    "انتفاخ البطن",
    "دوخة",
    "جلد جاف",
    "الجلد الجاف المتشقق الذي قد ينزف أو يسبب الحكة",
    "تجفيف وتنميل الشفاه",
    "ألم الأذن",
    "ينزف بسهولة",
    "تضخم الغدة الدرقية",
    "الجوع المفرط",
    "ممارسة التعصب",
    "علاقات زوجية اضافية",
    "تورم الوجه",
    "إغماء",
    "تاريخ العائلة",
    "إعياء",
    "الشعور بالانتفاخ بعد الأكل",
    "الشعور بالشبع بعد تناول كميات قليلة من الطعام",
    "حُمى",
    "شعر ناعم هش",
    "تراكم السوائل في البطن (الاستسقاء).",
    "احتباس السوائل",
    "السوائل الزائدة",
    "رائحة كريهة من البول",
    "التهابات متكررة",
    "نزيف أنفي متكرر",
    "كثرة التبول",
    "التثاؤب المتكرر",
    "الشعور العام بعدم الراحة",
    "ضجة كبيرة",
    "صداع الراس",
    "حرقة من المعدة",
    "حرقة في المعدة أو آلام في البطن",
    "ارتفاع درجة الحرارة",
    "آلام مفصل الورك",
    "تاريخ استهلاك الكحول",
    "قشعريرة",
    "بحة في الصوت",
    "ضعف الذاكرة",
    "عدم القدرة على التعرف",
    "عدم القدرة على البلع",
    "زيادة الشهية",
    "زيادة الحساسية للبرد",
    "زيادة العطش",
    "زيادة بحة الصوت",
    "عسر الهضم",
    "التهاب في وحول المفاصل",
    "المسامير الالتهابية",
    "تشنجات أو تشنجات لا إرادية",
    "التنفس غير المنتظم",
    "عدم انتظام ضربات القلب",
    "مستوى السكر غير المنتظم",
    "التهيج",
    "تهيج في الشرج",
    "متلهف، متشوق",
    "حكة حول واحد أو أكثر من الأوردة",
    "حكة في الجلد",
    "الم المفاصل",
    "ألم الركبة",
    "قلة التركيز",
    "كتل كبيرة وصلبة ومؤلمة تحت الجلد",
    "الخمول",
    "دوار",
    "خسارة الوزن",
    "فقدان التوازن",
    "فقدان الوعي",
    "فقدان المرونة",
    "فقدان الدورة الشهرية",
    "فقدان الشهية",
    "فقدان التوازن",
    "فقدان حاسة الشم",
    "حمى منخفضة ",
    "كتل تحت الجلد",
    "توعك",
    "فقدان الذاكرة",
    "حمى خفيفة",
    "تغيرات في المزاج",
    "تصلب الحركة",
    "البلغم المخاطي",
    "آلام العضلات وآلام المفاصل",
    "آلام العضلات والليونة والصلابة",
    "ضعف العضلات",
    "ألم عضلي",
    "هزال العضلات",
    "غثيان",
    "الم الرقبة",
    "العصبية",
    "تعرق ليلي",
    "لا استجابة للأطراف",
    "لا استجابة للمنبهات المؤلمة",
    "ثورات الجلد العقدي",
    "الخدر والضعف بين ذراعيك أو يديك أو ساقيك أو قدميك",
    "خدر في يدك وأصابعك",
    "بدانة",
    "تشوه واضح في اليد",
    "آلام العضلات في بعض الأحيان",
    "ألم في الحلق",
    "ألم في رقبتك وحلقك",
    "ألم مع التنفس أو السعال",
    "ألم وراء العيون",
    "ألم أثناء حركات الأمعاء",
    "ألم في منطقة الشرج",
    "المشي المؤلم",
    "جلد شاحب",
    "لون البراز شاحب",
    "مرور الغازات",
    "تمرير كميات صغيرة متكررة من البول",
    "بقع في الحلق",
    "القيء المستمر",
    "البلغم",
    "التهاب رئوي",
    "فرط البول",
    "وجود الكيتونات في البول",
    "الضغط أو الضيق أو الألم أو الإحساس بالضغط أو التألم في صدرك أو ذراعيك قد ينتشر إلى رقبتك أو فكك أو ظهره",
    "مشاكل الرؤية",
    "إنتاج المخاط",
    "عروق بارزة على العجل",
    "عيون منتفخة",
    "وجه منتفخ ",
    "كثرة البثور",
    "بقع مرتفعة باللون الوردي أو الأحمر",
    "تنفس سريع",
    "سرعة النبض",
    "تلقي نقل الدم",
    "استلام الحقن غير اليومية",
    "اللوزتين الحمراء",
    "قرحة حمراء حول الأنف",
    "بقع حمراء فوق الجسم",
    "احمرار الجلد",
    "احمرار في راحة اليدين",
    "احمرار العيون",
    "تجدد الطعام أو اللعاب",
    "الأرق",
    "سيلان الأنف",
    "البلغم صدئ",
    "الجلد المتقشر",
    "تنخم الحلق",
    "النوبات",
    "الإحساس بقطعة في حلقك",
    "نزيف في الأنف الشديد",
    "ألم شديد في اليد",
    "ضيق شديد في التنفس",
    "ضعف جنسي",
    "تهتز قشعريرة",
    "رعشة (ارتجاف)",
    "ضيق في التنفس",
    "ضغط الجيوب الأنفية",
    "احمرار الجلد",
    "ترقق الجلد",
    "تقشير الجلد",
    "الطفح الجلدي",
    "القروح بطيئة الشفاء",
    "رد  الفعل  البطيء (مع التحديق)",
    "كلام غير واضح",
    "بثور صغيرة مملوءة بالسوائل",
    "نتوءات حمراء صغيرة مؤلمة",
    "بقع تحجيم صغيرة",
    "خدوش صغيرة في الأظافر",
    "العطس",
    "إلتهاب الحلق",
    "التهاب الحلق وتقرحات الفم المؤلمة",
    "الأورام الوعائية العنكبوتية",
    "الأوعية الدموية الشبيهة بالعنكبوت على بشرتك",
    "حركات دورانية",
    "البقع ، الفضة مثل الغبار",
    "اكتشاف التبول",
    "تصلب الرقبة",
    "صلابة(تصلب)",
    "تقلصات وآلام في المعدة",
    "نزيف في المعدة",
    "حكة داخلية في المعدة",
    "آلام المعدة",
    "رغبة قوية ومستمرة في التبول",
    "انسداد الأنف",
    "دوار مفاجئ(دوخة)",
    "خدر أو ضعف مفاجئ في الوجه أو الذراع أو الساق ، خاصة في جانب واحد من الجسم",
    "العيون الغارقة",
    "التعرق",
    " فرط التعرق",
    "تورم الغدد الليمفاوية",
    "تورم",
    "تورم في الكاحلين (وذمة)",
    "تورم في قدميك",
    "تورم في ساقيك",
    "تورم المفاصل",
    "تضخم في المعدة",
    "تورم وتصلب المفاصل",
    "تورم الغدد",
    "انتفاخ الغدد الليمفاوية ، وخاصة على الرقبة",
    "تورم الغدد الليمفاوية في رقبتك",
    "تورم اللوزتين",
    "تورم الأوعية الدموية في الساقين",
    "تورم الساقين",
    "الليونة",
    "أظافر سميكة أو محفورة أو ممزقة",
    "شعر خفيف",
    "تهيج الحلق",
    "تنميل في ذراعيك",
    "تنميل أو خدر في الشفتين أو اللسان أو الخد",
    "الإرهاق",
    "التعرض للسم (حمى النمشية)",
    "مشكلة في النوم",
    "مشكلة في الكلام",
    "مشكلة في الفهم",
    "مشكلة في المشي",
    "القرحة على اللسان",
    "فقدان الوزن غير المقصود",
    "عدم الثبات",
    "آلام في الجزء العلوي من البطن",
    "مشاكل المسالك البولية",
    "البول الذي يبدو غائما",
    "ظهور البول باللون الأحمر أو الوردي الفاتح أو بلون الكولا ، وهي علامة على وجود دم في البول",
    "الأوردة ذات اللون الأرجواني الداكن أو الأزرق",
    "اضطرابات بصرية",
    "التقيؤ",
    "جلد أحمر دافئ فوق المفصل المصاب",
    "عيون دامعة",
    "نبض ضعيف",
    "ضعف",
    "ضعف في الأطراف",
    "ضعف جانب واحد من الجسم",
    "زيادة الوزن",
    "فقدان الوزن",
    "التنفس مع صوت صفير أو قعقعة في الصدر.",
    "الصفير عند الزفير",
    "الرؤوس البيضاء",
    "بياض العيون",
    "تفاقم الألم بعد الجلوس أو الوقوف لفترة طويلة",
    "اصفرار الجلد والعينين (اليرقان).",
    "ناز القشرة الصفراء",
    "البول الأصفر",
    "اصفرار العيون",
    "جلد مصفر",
  ]);


  const [prediction, setPrediction] = useState("");

  const fetchGeminiPrediction = async (selectedSymptoms) => {
    try {
      setIsLoading(true);
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        setPrediction(i18n.language === 'ar'
          ? "عذراً، نظام التوقع المحلي متوقف حالياً ولم يتم العثور على مفتاح API لـ Gemini."
          : "Sorry, the local prediction system is down and no Gemini API key was found.");
        setIsLoading(false);
        onOpen();
        return;
      }

      const symptomsList = selectedSymptoms.join(", ");
      const prompt = i18n.language === 'ar'
        ? `أنت مساعد طبي خبير. بناءً على هذه الأعراض المختارة: (${symptomsList})، قدم تشخيصاً محتملاً موجزاً ودقيقاً بلغة بسيطة، مع توضيح أهمية استشارة الطبيب. اجعل الرد باللغة العربية.`
        : `You are an expert medical assistant. Based on these selected symptoms: (${symptomsList}), provide a concise and accurate potential diagnosis in simple language, highlighting the importance of consulting a doctor.`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await axios.post(url, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 }
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      setPrediction(aiResponse);
    } catch (error) {
      console.error("Gemini fallback failed:", error);
      setPrediction(i18n.language === 'ar'
        ? "عذراً، تعذر الحصول على تشخيص حالياً. يرجى المحاولة لاحقاً."
        : "Sorry, unable to get a diagnosis at this time. Please try again later.");
    } finally {
      setIsLoading(false);
      onOpen();
    }
  };

  const predictionHandle = () => {
    setIsLoading(true);
    let symptomsArray = Object.values(posts);
    const requiredLength = 350;

    if (symptomsArray.length < requiredLength) {
      const padding = new Array(requiredLength - symptomsArray.length).fill(0);
      symptomsArray = [...padding, ...symptomsArray];
    }

    const baseURL =
      "http://127.0.0.1:8000/predict/?symptoms=[" +
      symptomsArray +
      "]";

    axios
      .get(baseURL)
      .then((response) => {
        setPrediction(response.data);
        setIsLoading(false);
        onOpen();
      })
      .catch((err) => {
        console.warn("Local API failed, falling back to Gemini...");
        const selectedSymptoms = Object.entries(posts)
          .filter(([_, value]) => value === 1)
          .map(([key, _]) => key);

        if (selectedSymptoms.length > 0) {
          fetchGeminiPrediction(selectedSymptoms);
        } else {
          setPrediction(i18n.language === 'ar'
            ? "يرجى اختيار عرض واحد على الأقل."
            : "Please select at least one symptom.");
          setIsLoading(false);
          onOpen();
        }
      });
  };

  const getIsChecked = (symptomName) => {
    if (i18n.language === 'ar') {
      const index = postsAr.indexOf(symptomName);
      if (index !== -1) {
        const englishKey = Object.keys(posts)[index];
        return posts[englishKey] === 1;
      }
    }
    return posts[symptomName] === 1;
  };

  const handleCheckboxUnified = (status) => {
    const clonePost = { ...posts };
    if (i18n.language === 'ar') {
      const index = postsAr.indexOf(status.value);
      if (index !== -1) {
        const englishKey = Object.keys(clonePost)[index];
        clonePost[englishKey] = status.checked ? 1 : 0;
      }
    } else {
      clonePost[status.value] = status.checked ? 1 : 0;
    }
    setPosts(clonePost);
  };

  const handleSubmit = (e) => {
    console.log("ok");
    console.log(Object.values(posts));
    e.preventDefault();
  };
  return (
    <div className="App min-h-screen">
      <Switch>
        <Route
          exact
          path={`${match.path}/predict`}
          render={(props) => (
            <Predict
              keys={i18n.language === 'ar' ? keysAr : keys}
              onHandleCheckbox={handleCheckboxUnified}
              onHandleSubmit={handleSubmit}
              prediction={prediction}
              {...props}
            />
          )}
        />
        <Route
          path={match.path}
          render={(props) => (
            <List
              keys={i18n.language === 'ar' ? keysAr : keys}
              onHandleCheckbox={handleCheckboxUnified}
              onHandleSubmit={handleSubmit}
              predictionHandle={predictionHandle}
              prediction={prediction}
              isLoading={isLoading}
              posts={posts}
              getIsChecked={getIsChecked}
              {...props}
            />
          )}
        />
      </Switch>

      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        title={i18n.language === 'ar' ? 'نتائج الفحص الذكي' : 'Smart Diagnosis Results'}
      >
        {typeof prediction === 'object' && prediction !== null ? (
          <div className="space-y-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800">
              <span className="text-sm font-black text-[#0076f7] uppercase tracking-wider mb-2 block">
                {i18n.language === 'ar' ? 'التشخيص المقترح' : 'Suggested Diagnosis'}
              </span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {i18n.language === 'ar' ? prediction.prediction_in_arabic : prediction.prediction}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                <h4 className="font-black text-emerald-600 mb-2 flex items-center gap-2 text-sm">
                  <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                  {i18n.language === 'ar' ? 'الاحتياطات' : 'Precautions'}
                </h4>
                <ul className="text-xs font-bold text-gray-700 dark:text-gray-300 space-y-1">
                  {[prediction.precaution_1, prediction.precaution_2, prediction.precaution_3, prediction.precaution_4].map((p, i) => {
                    const txt = i18n.language === 'ar' ? prediction?.[`precaution_${i + 1}_in_arabic`] : prediction?.[`precaution_${i + 1}`];
                    return txt && txt !== "NaN" ? <li key={i}>• {txt}</li> : null;
                  })}
                </ul>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                <h4 className="font-black text-amber-600 mb-2 flex items-center gap-2 text-sm">
                  <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                  {i18n.language === 'ar' ? 'عوامل الخطر' : 'Risk Factors'}
                </h4>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {i18n.language === 'ar' ? prediction.Risk_Factors_in_arabic : prediction.Risk_Factors}
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border-2 border-rose-100 dark:border-rose-800">
              <h4 className="font-black text-rose-600 mb-1 flex items-center gap-2 text-sm">
                ⚠️ {i18n.language === 'ar' ? 'تنبيه هام' : 'Important Notice'}
              </h4>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                {prediction.warning}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[var(--bg-color)] rounded-3xl border border-[var(--border-color)] whitespace-pre-wrap leading-relaxed font-bold text-[var(--text-main)]">
            {prediction}
          </div>
        )}
      </CustomModal>
    </div>
  );
}

export default Main;
