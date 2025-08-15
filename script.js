document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const importerSection = document.getElementById("importer-section");
  const resultsSection = document.getElementById("results-section");
  const monthsContainer = document.getElementById("months-container");
  const monthDetail = document.getElementById("month-detail");
  const complianceResults = document.getElementById("compliance-results");
  const monthName = document.getElementById("month-name");
  const fileNameDisplay = document.getElementById("file-name-display");
  const errorMessage = document.getElementById("error-message");
  const resetButton = document.getElementById("reset-data-button");

  let jsonData = null;
  let monthsData = null;

  // Fonction de réinitialisation
  function resetData() {
    localStorage.removeItem("jsonData");
    localStorage.removeItem("monthsData");
    window.location.reload();
  }

  // Gère le bouton de réinitialisation
  resetButton.addEventListener("click", () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser les données ? Cela effacera toutes les analyses et vous permettra d'importer un nouveau fichier."
      )
    ) {
      resetData();
    }
  });

  // Chargement initial des données depuis le localStorage
  function loadInitialData() {
    const storedJsonData = localStorage.getItem("jsonData");
    if (storedJsonData) {
      try {
        const parsedData = JSON.parse(storedJsonData);
        jsonData = parsedData.bulletins;
        monthsData = aggregateByMonth(jsonData);
        displayMonths();
        importerSection.classList.add("hidden");
        resultsSection.classList.remove("hidden");
        fileNameDisplay.textContent =
          localStorage.getItem("fileName") || "Fichier importé";
        resetButton.classList.remove("hidden");
      } catch (e) {
        console.error("Erreur lors de la lecture des données stockées :", e);
        localStorage.removeItem("jsonData");
        localStorage.removeItem("monthsData");
        importerSection.classList.remove("hidden");
        resultsSection.classList.add("hidden");
        resetButton.classList.add("hidden");
        errorMessage.textContent =
          "Erreur lors de la lecture des données stockées. Veuillez réimporter un fichier JSON valide.";
      }
    } else {
      importerSection.classList.remove("hidden");
      resultsSection.classList.add("hidden");
      resetButton.classList.add("hidden");
    }
  }

  // Gestion de l'importation de fichier
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  function handleFile(file) {
    if (file.type !== "application/json") {
      errorMessage.textContent = "Veuillez importer un fichier JSON valide.";
      return;
    }
    errorMessage.textContent = "";
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsedData = JSON.parse(e.target.result);
        jsonData = parsedData.bulletins;

        if (!Array.isArray(jsonData)) {
          errorMessage.textContent =
            'Le fichier JSON est valide mais ne contient pas le format attendu ("bulletins" : [ ... ]).';
          return;
        }

        localStorage.setItem("jsonData", JSON.stringify(parsedData));
        localStorage.setItem("fileName", file.name);
        monthsData = aggregateByMonth(jsonData);
        displayMonths();
        importerSection.classList.add("hidden");
        resultsSection.classList.remove("hidden");
        fileNameDisplay.textContent = file.name;
        resetButton.classList.remove("hidden");
      } catch (error) {
        errorMessage.textContent =
          "Erreur lors de la lecture du fichier JSON. Veuillez vérifier sa syntaxe.";
        console.error("Erreur de parsing JSON :", error);
      }
    };
    reader.readAsText(file);
  }

  // Fonction de mapping pour convertir le nom du mois en numéro
  const monthNameToNumber = {
    Janvier: 1,
    Février: 2,
    Mars: 3,
    Avril: 4,
    Mai: 5,
    Juin: 6,
    Juillet: 7,
    Août: 8,
    Septembre: 9,
    Octobre: 10,
    Novembre: 11,
    Décembre: 12,
  };

  // Agrégation par mois
  function aggregateByMonth(data) {
    const aggregated = {};
    if (!data) return {};

    data.forEach((item) => {
      const monthNumber = monthNameToNumber[item.mois];
      const monthKey = `${item.annee}-${monthNumber
        .toString()
        .padStart(2, "0")}`;
      if (!aggregated[monthKey]) {
        aggregated[monthKey] = {
          period: `${item.mois} ${item.annee}`,
          details: item,
        };
      }
    });
    return aggregated;
  }

  // Affichage des mois
  function displayMonths() {
    monthsContainer.innerHTML = "";
    monthsContainer.classList.remove("hidden");
    if (!monthsData) return;

    Object.keys(monthsData)
      .sort()
      .forEach((monthKey) => {
        const button = document.createElement("button");
        button.className = "month-button";
        button.textContent = monthsData[monthKey].period;
        button.addEventListener("click", () => {
          document
            .querySelectorAll(".month-button")
            .forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
          displayMonthDetails(monthKey);
        });
        monthsContainer.appendChild(button);
      });
  }

  // Affichage des détails d'un mois
  function displayMonthDetails(monthKey) {
    monthDetail.classList.remove("hidden");
    monthName.textContent = monthsData[monthKey].period;
    complianceResults.innerHTML = "";

    const monthData = monthsData[monthKey].details;
    const complianceStatus = checkCompliance(monthData);

    let summaryHTML = `
            <div class="summary-section">
                <p><strong>Salaire brut :</strong> ${
                  monthData.salaire_brut !== undefined
                    ? monthData.salaire_brut.toFixed(2)
                    : "N/A"
                }</p>
                <p><strong>Net imposable :</strong> ${
                  monthData.net_imposable !== undefined
                    ? monthData.net_imposable.toFixed(2)
                    : "N/A"
                }</p>
                <p><strong>Net social :</strong> ${
                  monthData.net_social !== undefined
                    ? monthData.net_social.toFixed(2)
                    : "N/A"
                }</p>
                <p><strong>Coût global :</strong> ${
                  monthData.cout_global !== undefined
                    ? monthData.cout_global.toFixed(2)
                    : "N/A"
                }</p>
            </div>
            <hr>
        `;

    let tableHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th colspan="2">Libellé</th>
                        <th>Base salariale</th>
                        <th>Taux salarial</th>
                        <th>Montant salarial</th>
                        <th>Base patronale</th>
                        <th>Taux patronal</th>
                        <th>Montant patronal</th>
                    </tr>
                </thead>
                <tbody>
        `;

    const cotisations = {
      maladie: "Assurance maladie, maternité, invalidité, décès",
      csa: "Contribution solidarité autonomie (CSA)",
      vieille_deplafonnee: "Vieillesse déplafonnée",
      vieillesse_plafonnee: "Vieillesse plafonnée",
      allocation_familiale: "Allocations familiales",
      accident_du_travail: "Accident du travail / maladies professionnelles",
      fnal: "Fonds national d'aide au logement",
      csg_deductible: "CSG déductible de l'impôt sur le revenu",
      csg_non_deductible: "CSG non déductible de l'impôt sur le revenu",
      csg_non_deductible_sur_heures_supplementaires:
        "CSG non déductible sur heures supplémentaires",
      contribution_au_dialogue_social: "Contribution au dialogue social",
      reduction_des_cotisation_urssaf: "Réduction des cotisations URSSAF",
      assurance_chomage: "Assurance chômage",
      ags: "Garantie de l'assurance chômage",
      taxe_apprentissage: "Taxe d'apprentissage",
      formation_professionnelle: "Formation professionnelle",
      retraite_t1: "Retraite T1",
      retraite_t2: "Retraite T2",
      ceg_t1: "CEG T1",
      ceg_t2: "CEG T2",
      reduction_des_cotisation_retraites:
        "Réduction des cotisations de retraite",
      prevoyance_non_cadre_ta: "Prévoyance non-cadre TA",
      rente_education_non_cadre_ta: "Rente éducation non-cadre TA",
      prevoyance_non_cadre_tb: "Prévoyance non-cadre TB",
      rente_education_non_cadre_tb: "Rente éducation non-cadre TB",
      frais_de_sante: "Frais de santé",
      taxe_apprentissage_liberatoire: "Taxe d'apprentissage libératoire",
    };

    const maladieRuleResult = complianceStatus.maladie;
    const maladieData = monthData.maladie || {};

    // Ligne de l'assurance maladie gérée séparément pour la conformité
    if (maladieRuleResult.status === "non-conforme") {
      tableHTML += `
                <tr class="non-conforme">
                    <td colspan="2">${cotisations["maladie"]}</td>
                    <td>${
                      maladieData.bases !== undefined
                        ? maladieData.bases.toFixed(2)
                        : ""
                    }</td>
                    <td>${
                      maladieData.tauxs !== undefined
                        ? (maladieData.tauxs * 100).toFixed(2) + " %"
                        : ""
                    }</td>
                    <td>${
                      maladieData.montants !== undefined
                        ? maladieData.montants.toFixed(2)
                        : ""
                    }</td>
                    <td>${
                      maladieData.basep !== undefined
                        ? maladieData.basep.toFixed(2)
                        : ""
                    }</td>
                    <td>${
                      maladieData.tauxp !== undefined
                        ? (maladieData.tauxp * 100).toFixed(2) + " %"
                        : ""
                    } <span class="error-info">(Attendu: ${(
        maladieRuleResult.expected * 100
      ).toFixed(2)} %)</span></td>
                    <td>${
                      maladieData.montantp !== undefined
                        ? maladieData.montantp.toFixed(2)
                        : ""
                    }</td>
                </tr>
            `;
    } else {
      tableHTML += `
                <tr>
                    <td colspan="2">${cotisations["maladie"]}</td>
                    <td>${
                      maladieData.bases !== undefined
                        ? maladieData.bases.toFixed(2)
                        : ""
                    }</td>
                    <td>${
                      maladieData.tauxs !== undefined
                        ? (maladieData.tauxs * 100).toFixed(2) + " %"
                        : ""
                    }</td>
                    <td>${
                      maladieData.montants !== undefined
                        ? maladieData.montants.toFixed(2)
                        : ""
                    }</td>
                    <td>${
                      maladieData.basep !== undefined
                        ? maladieData.basep.toFixed(2)
                        : ""
                    }</td>
                    <td>${
                      maladieData.tauxp !== undefined
                        ? (maladieData.tauxp * 100).toFixed(2) + " %"
                        : ""
                    }</td>
                    <td>${
                      maladieData.montantp !== undefined
                        ? maladieData.montantp.toFixed(2)
                        : ""
                    }</td>
                </tr>
            `;
    }

    // Boucle pour les autres cotisations
    for (const key in cotisations) {
      if (key === "maladie") continue; // Ignorer la maladie, déjà traitée
      const item = monthData[key];
      if (item) {
        tableHTML += `
                    <tr>
                        <td colspan="2">${cotisations[key]}</td>
                        <td>${
                          item.bases !== undefined ? item.bases.toFixed(2) : ""
                        }</td>
                        <td>${
                          item.tauxs !== undefined
                            ? (item.tauxs * 100).toFixed(2) + " %"
                            : ""
                        }</td>
                        <td>${
                          item.montants !== undefined
                            ? item.montants.toFixed(2)
                            : ""
                        }</td>
                        <td>${
                          item.basep !== undefined ? item.basep.toFixed(2) : ""
                        }</td>
                        <td>${
                          item.tauxp !== undefined
                            ? (item.tauxp * 100).toFixed(2) + " %"
                            : ""
                        }</td>
                        <td>${
                          item.montantp !== undefined
                            ? item.montantp.toFixed(2)
                            : ""
                        }</td>
                    </tr>
                `;
      }
    }

    tableHTML += `
                </tbody>
            </table>
        `;

    complianceResults.innerHTML = summaryHTML + tableHTML;
  }

  loadInitialData();
});
