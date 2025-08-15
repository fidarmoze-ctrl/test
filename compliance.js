// compliance.js

// Définition des constantes (PMSS, taux, etc.) pour 2024
const complianceConstants = {
  // Plafond Mensuel de la Sécurité Sociale (PMSS)
  pmss: 3864,

  // Taux de cotisations
  taux: {
    maladie: {
      salarial: 0,
      patronal: 0.13,
    },
    csa: {
      salarial: 0,
      patronal: 0.003,
    },
    vieillesse_plafonnee: {
      salarial: 0.069,
      patronal: 0.0855,
    },
    vieillesse_deplafonnee: {
      salarial: 0.004,
      patronal: 0.0202,
    },
    allocation_familiale: {
      salarial: 0,
      patronal: 0.0525,
    },
    accident_du_travail: {
      salarial: 0,
      patronal: 0.02,
    },
    fnal: {
      salarial: 0,
      patronal: 0.001,
    },
    csg_deductible: {
      salarial: 0.068,
    },
    csg_non_deductible: {
      salarial: 0.029,
    },
    contribution_au_dialogue_social: {
      patronal: 0.00016,
    },
    assurance_chomage: {
      salarial: 0,
      patronal: 0.0405,
    },
    ags: {
      salarial: 0,
      patronal: 0.0019,
    },
    taxe_apprentissage: {
      patronal: 0.0068,
    },
    formation_professionnelle: {
      patronal: 0.0055,
    },
    retraite_t1: {
      salarial: 0.0787,
      patronal: 0.0129,
    },
    retraite_t2: {
      salarial: 0.0919,
      patronal: 0.0176,
    },
    ceg_t1: {
      salarial: 0.0035,
      patronal: 0.006,
    },
    ceg_t2: {
      salarial: 0.0047,
      patronal: 0.0081,
    },
    prevoyance_non_cadre_ta: {
      salarial: 0.005,
      patronal: 0.005,
    },
    prevoyance_non_cadre_tb: {
      salarial: 0.005,
      patronal: 0.005,
    },
    frais_de_sante: {
      salarial: 0.005,
      patronal: 0.005,
    },
  },

  // Règles de conformité
  rules: {
    maladie: {
      condition: (data) => data.salaire_brut > 2.5 * complianceConstants.pmss,
      target: "maladie.tauxp",
      expected: 0.07,
    },
    autre_regle: {
      condition: (data) => data.salaire_brut < 2 * complianceConstants.pmss,
      target: "maladie.tauxp",
      expected: 0.13,
    },
  },
};

// Fonction pour vérifier la conformité
function checkCompliance(data) {
  const results = {};
  for (const key in complianceConstants.rules) {
    const rule = complianceConstants.rules[key];
    let complianceStatus = "non-applicable";
    let actualValue = null;
    let expectedValue = null;

    if (rule.condition(data)) {
      complianceStatus = "non-conforme";
      actualValue = eval(`data.${rule.target}`);
      expectedValue = rule.expected;

      if (actualValue === expectedValue) {
        complianceStatus = "conforme";
      }
    }
    results[key] = {
      status: complianceStatus,
      expected: expectedValue,
      actual: actualValue,
    };
  }
  return results;
}
