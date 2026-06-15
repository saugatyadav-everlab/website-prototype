export interface Category {
  id: string;
  label: string;
  color: string; // CSS gradient for the category dot
  biomarkers: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: "heart-health",
    label: "Heart health",
    color: "linear-gradient(135deg, #ff6b6b, #c0392b)",
    biomarkers: [
      "Apolipoprotein B", "HDL Cholesterol", "LDL Cholesterol", "Lipoprotein (a)",
      "Non-HDL Cholesterol", "Serum Triglycerides", "Total Cholesterol",
      "High Sensitivity C-Reactive Protein", "Homocysteine", "ApoB:LDL-C Ratio",
      "Remnant Cholesterol", "AIP (Atherogenic Index)", "MHR (Monocyte:HDL Ratio)",
      "CAR (CRP:Albumin Ratio)", "CT Calcium Score", "CT Coronary Angiogram",
      "Systolic Blood Pressure", "Diastolic Blood Pressure",
    ],
  },
  {
    id: "cancer-detection",
    label: "Cancer detection",
    color: "linear-gradient(135deg, #667eea, #764ba2)",
    biomarkers: [
      "Cancer Antigen 125", "C-Reactive Protein", "Prostate Specific Antigen",
      "Alanine Aminotransferase", "Full Body MRI", "Colonoscopy",
      "Gastroscopy", "Lung CT Screening", "Ultrasound", "Skin Check",
      "CT Chest Lung Cancer Screening",
    ],
  },
  {
    id: "metabolic-function",
    label: "Metabolic function",
    color: "linear-gradient(135deg, #f7971e, #ffd200)",
    biomarkers: [
      "Estimated Average Glucose", "Fasting Glucose", "Fasting Insulin",
      "HbA1c (IFCC)", "HbA1c (NGSP)", "Uric Acid", "HOMA-IR",
      "FIB-4", "AST:ALT Ratio", "GGT:HDL Ratio",
    ],
  },
  {
    id: "autoimmunity",
    label: "Autoimmunity",
    color: "linear-gradient(135deg, #11998e, #38ef7d)",
    biomarkers: [
      "Basophils", "Eosinophils", "Lymphocytes", "Monocytes",
      "Neutrophils", "Total White Cell Count",
    ],
  },
  {
    id: "kidney-function",
    label: "Kidney function",
    color: "linear-gradient(135deg, #2980b9, #6dd5fa)",
    biomarkers: [
      "Creatinine", "Estimated Glomerular Filtration Rate", "Urea",
      "BUN", "BUN:Creatinine Ratio", "SUA:Creatinine Ratio", "Ca:Phosphate Ratio",
    ],
  },
  {
    id: "liver-function",
    label: "Liver function",
    color: "linear-gradient(135deg, #56ab2f, #a8e063)",
    biomarkers: [
      "Alanine Aminotransferase", "Alkaline Phosphatase", "Aspartate Transaminase",
      "Gamma-GT", "Serum Albumin", "Serum Bilirubin", "Serum Globulin",
      "Total Serum Protein",
    ],
  },
  {
    id: "hormone-health",
    label: "Hormone function",
    color: "linear-gradient(135deg, #f953c6, #b91d73)",
    biomarkers: [
      "Estradiol", "Progesterone", "LH/FSH Ratio", "Luteinizing Hormone",
      "Follicle-Stimulating Hormone", "Prolactin", "Free Testosterone",
      "Total Testosterone", "Free Androgen Index", "DHEAS", "Cortisol",
      "Sex Hormone-Binding Globulin", "Parathyroid Hormone", "ACTH",
      "Serum Ferritin", "Serum Transferrin", "Total Iron-Binding Capacity",
    ],
  },
  {
    id: "blood-bone-marrow",
    label: "Blood and Bone marrow function",
    color: "linear-gradient(135deg, #e52d27, #b31217)",
    biomarkers: [
      "Haematocrit", "Haemoglobin", "Mean Corpuscular Haemoglobin",
      "Mean Corpuscular Haemoglobin Concentration", "Mean Corpuscular Volume",
      "Platelets", "Red Cell Count", "Red Cell Distribution Width",
    ],
  },
  {
    id: "genetic-health",
    label: "Genetic health",
    color: "linear-gradient(135deg, #4776e6, #8e54e9)",
    biomarkers: [
      "Preventive Health Genetic Test", "Pharmacogenetics Blood Test",
      "DNA Methylation",
    ],
  },
  {
    id: "bone-health",
    label: "Bone health",
    color: "linear-gradient(135deg, #bdc3c7, #2c3e50)",
    biomarkers: [
      "Femoral Neck Densities", "Multi-level Lumbar Spine Densities",
      "Standardised Bone Density Comparisons", "Total Body Bone Mineral Content",
      "Vitamin D",
    ],
  },
  {
    id: "gut-health",
    label: "Gut health",
    color: "linear-gradient(135deg, #1a9850, #91cf60)",
    biomarkers: ["Gut Microbiome"],
  },
  {
    id: "body-composition",
    label: "Body composition",
    color: "linear-gradient(135deg, #f2994a, #f2c94c)",
    biomarkers: [
      "Android/Gynoid Ratio", "Body Mass Index", "Estimated VAT Mass",
      "Estimated VAT Volume", "Fat Free Mass Index", "Fat Mass Index",
      "Lean Mass of Arms", "Lean Mass of Legs", "Relative Skeletal Muscle Index",
      "Total Body % Fat", "Total Fat Mass", "Total Lean Mass",
      "Upper Body Lean Mass Asymmetry", "Lower Body Lean Mass Asymmetry",
    ],
  },
  {
    id: "allergies",
    label: "Allergies",
    color: "linear-gradient(135deg, #a8e063, #56ab2f)",
    biomarkers: ["Cat Allergy", "Dog Allergy", "Dustmite", "Rye Grass Pollen", "Alternaria alternata"],
  },
  {
    id: "heavy-metals",
    label: "Heavy metals",
    color: "linear-gradient(135deg, #636363, #a2ab58)",
    biomarkers: ["Lead", "Mercury", "Arsenic", "Cadmium", "Copper", "Selenium", "Aluminium", "Chromium", "Zinc"],
  },
  {
    id: "muscle-health",
    label: "Muscle health",
    color: "linear-gradient(135deg, #f7971e, #ffd200)",
    biomarkers: [
      "Grip Strength", "Isometric Squat", "Balance Assessment",
      "Exercise Optimisation Plan", "Counter Movement Jump",
    ],
  },
  {
    id: "aerobic-capacity",
    label: "Aerobic capacity",
    color: "linear-gradient(135deg, #2980b9, #2ecc71)",
    biomarkers: ["VO2 max"],
  },
  {
    id: "nutrition",
    label: "Nutrition",
    color: "linear-gradient(135deg, #00b09b, #96c93d)",
    biomarkers: [
      "Magnesium", "Folate", "Serum Calcium", "Phosphate", "Active B12",
      "Food Diary Analysis", "Nutrition Optimisation", "Continuous Glucose Monitoring",
    ],
  },
  {
    id: "electrolytes",
    label: "Electrolytes",
    color: "linear-gradient(135deg, #0099f7, #f11712)",
    biomarkers: ["Bicarbonate", "Chloride", "Potassium", "Sodium"],
  },
  {
    id: "inflammation",
    label: "Inflammation",
    color: "linear-gradient(135deg, #ff416c, #ff4b2b)",
    biomarkers: [
      "ESR", "NLR (Neutrophil:Lymphocyte Ratio)", "PLR (Platelet:Lymphocyte Ratio)",
      "SIRI (Systemic Inflammation Index)",
    ],
  },
  {
    id: "hormone-ratios",
    label: "Hormone ratios",
    color: "linear-gradient(135deg, #da22ff, #9733ee)",
    biomarkers: [
      "Cortisol:DHEA-S Ratio", "T:Cortisol Ratio", "Free Androgen Index",
      "T:E2 Ratio", "LH:FSH Ratio", "Pg:E2 Ratio",
    ],
  },
  {
    id: "iron-studies",
    label: "Iron studies",
    color: "linear-gradient(135deg, #c0392b, #f39c12)",
    biomarkers: ["Serum Iron", "Transferrin Saturation", "Serum Ferritin"],
  },
  {
    id: "biological-age",
    label: "Biological age",
    color: "linear-gradient(135deg, #00c6ff, #0072ff)",
    biomarkers: ["Biological Age"],
  },
];
