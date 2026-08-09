// Scripts for pages\auth\login\dashboard\dashboard.html
// AI Nickname generator logic
    function generateNickname() {
      const nicknameLabel = document.getElementById("nickname-label");
      nicknameLabel.textContent = "Generating...";
      setTimeout(() => {
        const nicknames = [
          "CyberSage",
          "NeonOracle",
          "QuantumPilot",
          "BinaryWiz",
          "DigitalMaverick",
          "PixelGuru",
          "DataNomad",
          "CircuitShaman",
          "TechnoProphet",
          "SynthVisionary"
        ];
        const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
        nicknameLabel.textContent = randomNickname;
      }, 1000);
    }
    document.getElementById("nickname-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      generateNickname();
    });

    // Placeholder click events for panels (for demonstration)
    document.getElementById("crypto-panel").addEventListener("click", function() {
      alert("Open CRYPTO details panel");
    });
    document.getElementById("inventory-panel").addEventListener("click", function() {
      alert("Open IN-GAME INVENTORY panel");
    });
    document.getElementById("marketplace-panel").addEventListener("click", function() {
      alert("Open MARKET PLACE panel");
    });
