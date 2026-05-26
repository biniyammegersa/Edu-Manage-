// Predefined academic template checklist
const CHAPTER_TEMPLATES = {
  1: {
    name: 'Introduction',
    requiredSections: [
      { id: 'background', terms: [/background/i, /introduction/i] },
      { id: 'problem_statement', terms: [/problem\s+statement/i] },
      { id: 'objectives', terms: [/objective/i, /aim/i] },
      { id: 'scope', terms: [/scope\s+(and|&)\s+limitation/i, /delimitation/i, /scope/i] },
      { id: 'feasibility', terms: [/feasibility\s+study/i, /feasibility/i] },
      { id: 'methodology', terms: [/methodology/i, /research\s+design/i] },
      { id: 'development_tools', terms: [/development\s+tools/i, /tools\s+and\s+technologies/i] },
      { id: 'team_composition', terms: [/team\s+composition/i, /schedule/i] }
    ]
  },
  2: {
    name: 'Existing System and Literature Review',
    requiredSections: [
      { id: 'literature_review', terms: [/literature\s+review/i, /theoretical\s+framework/i] },
      { id: 'existing_systems', terms: [/existing\s+system/i, /legacy\s+system/i] },
      { id: 'gap_analysis', terms: [/gap\s+analysis/i, /limitation\s+of\s+existing/i, /weakness/i] }
    ]
  },
  3: {
    name: 'Proposed System',
    requiredSections: [
      { id: 'functional_requirements', terms: [/functional\s+requirement/i] },
      { id: 'non_functional_requirements', terms: [/non-functional\s+requirement/i, /non\s+functional/i] },
      { id: 'use_case_models', terms: [/use\s+case\s+model/i, /use\s+case\s+diagram/i, /usecase/i] }
    ]
  },
  4: {
    name: 'System Design',
    requiredSections: [
      { id: 'system_architecture', terms: [/architecture/i, /system\s+structure/i] },
      { id: 'uml_diagrams', terms: [/uml/i, /sequence\s+diagram/i, /class\s+diagram/i] },
      { id: 'database_design', terms: [/database\s+design/i, /erd/i, /entity\s+relationship/i, /schema/i] }
    ]
  },
  5: {
    name: 'Implementation',
    requiredSections: [
      { id: 'technologies', terms: [/implementation\s+technologies/i, /stack/i] },
      { id: 'code_samples', terms: [/core\s+snippet/i, /implementation\s+detail/i, /code/i] }
    ]
  },
  6: {
    name: 'System Testing',
    requiredSections: [
      { id: 'testing_procedures', terms: [/testing\s+procedure/i, /testing\s+strategy/i] },
      { id: 'test_cases', terms: [/test\s+case/i, /unit\s+test/i, /integration\s+test/i] },
      { id: 'test_results', terms: [/test\s+results/i, /evaluation/i] }
    ]
  },
  7: {
    name: 'Conclusion and Recommendation',
    requiredSections: [
      { id: 'conclusion', terms: [/conclusion/i, /summary/i] },
      { id: 'recommendation', terms: [/recommendation/i, /future\s+work/i] }
    ]
  }
};

export const validateTemplate = (text, chapterNumber) => {
  const template = CHAPTER_TEMPLATES[chapterNumber];
  if (!template) {
    throw new Error(`Invalid Chapter Number: ${chapterNumber}`);
  }

  const presentSections = [];
  const missingSections = [];
  const warnings = [];

  // Scan through requirements
  template.requiredSections.forEach(section => {
    let found = false;
    for (const regex of section.terms) {
      if (regex.test(text)) {
        found = true;
        break;
      }
    }

    const humanName = section.id.replace(/_/g, ' ').toUpperCase();
    if (found) {
      presentSections.push(humanName);
    } else {
      missingSections.push(humanName);
      warnings.push(`Warning: Required section '${humanName}' was not clearly matched in the text.`);
    }
  });

  const passed = missingSections.length === 0;

  return {
    passed,
    presentSections,
    missingSections,
    warnings
  };
};
