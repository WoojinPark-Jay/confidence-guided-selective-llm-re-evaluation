window.studyResults = [
  {
    "dataset": "Additional Reddit 9000",
    "model": "Llama 3",
    "method": "CoT",
    "n": 9000,
    "phase1_accuracy_percent": 97.57777777777778,
    "accuracy_percent": 97.72222222222223,
    "macro_f1_percent": 97.7234339403727,
    "corrected": 28,
    "introduced": 15,
    "net_corrections": 13
  },
  {
    "dataset": "Additional Reddit 9000",
    "model": "Llama 3",
    "method": "Direct",
    "n": 9000,
    "phase1_accuracy_percent": 97.57777777777778,
    "accuracy_percent": 97.72222222222223,
    "macro_f1_percent": 97.72416328221291,
    "corrected": 32,
    "introduced": 19,
    "net_corrections": 13
  },
  {
    "dataset": "Additional Reddit 9000",
    "model": "Llama 3",
    "method": "SELF-DISCOVER",
    "n": 9000,
    "phase1_accuracy_percent": 97.57777777777778,
    "accuracy_percent": 97.76666666666667,
    "macro_f1_percent": 97.76884831587881,
    "corrected": 30,
    "introduced": 13,
    "net_corrections": 17
  },
  {
    "dataset": "Mixed Emotion",
    "model": "Llama 2",
    "method": "CoT",
    "n": 300,
    "phase1_accuracy_percent": 83.66666666666667,
    "accuracy_percent": 79.0,
    "macro_f1_percent": 78.92978881743872,
    "corrected": 19,
    "introduced": 33,
    "net_corrections": -14
  },
  {
    "dataset": "Mixed Emotion",
    "model": "Llama 2",
    "method": "Direct",
    "n": 300,
    "phase1_accuracy_percent": 83.66666666666667,
    "accuracy_percent": 76.33333333333333,
    "macro_f1_percent": 75.16269305742989,
    "corrected": 11,
    "introduced": 33,
    "net_corrections": -22
  },
  {
    "dataset": "Mixed Emotion",
    "model": "Llama 2",
    "method": "SELF-DISCOVER",
    "n": 300,
    "phase1_accuracy_percent": 83.66666666666667,
    "accuracy_percent": 89.33333333333333,
    "macro_f1_percent": 89.34518375849744,
    "corrected": 22,
    "introduced": 5,
    "net_corrections": 17
  },
  {
    "dataset": "Mixed Emotion",
    "model": "Llama 3",
    "method": "CoT",
    "n": 300,
    "phase1_accuracy_percent": 83.66666666666667,
    "accuracy_percent": 84.66666666666667,
    "macro_f1_percent": 84.67596324739182,
    "corrected": 15,
    "introduced": 12,
    "net_corrections": 3
  },
  {
    "dataset": "Mixed Emotion",
    "model": "Llama 3",
    "method": "Direct",
    "n": 300,
    "phase1_accuracy_percent": 83.66666666666667,
    "accuracy_percent": 89.33333333333333,
    "macro_f1_percent": 89.38034188034189,
    "corrected": 26,
    "introduced": 9,
    "net_corrections": 17
  },
  {
    "dataset": "Mixed Emotion",
    "model": "Llama 3",
    "method": "SELF-DISCOVER",
    "n": 300,
    "phase1_accuracy_percent": 83.66666666666667,
    "accuracy_percent": 92.66666666666667,
    "macro_f1_percent": 92.6965626965627,
    "corrected": 28,
    "introduced": 1,
    "net_corrections": 27
  },
  {
    "dataset": "Reddit",
    "model": "Llama 2",
    "method": "CoT",
    "n": 12000,
    "phase1_accuracy_percent": 96.91666666666667,
    "accuracy_percent": 96.925,
    "macro_f1_percent": 96.92399187492346,
    "corrected": 48,
    "introduced": 47,
    "net_corrections": 1
  },
  {
    "dataset": "Reddit",
    "model": "Llama 2",
    "method": "Direct",
    "n": 12000,
    "phase1_accuracy_percent": 96.91666666666667,
    "accuracy_percent": 96.99166666666666,
    "macro_f1_percent": 96.98976497737766,
    "corrected": 45,
    "introduced": 36,
    "net_corrections": 9
  },
  {
    "dataset": "Reddit",
    "model": "Llama 2",
    "method": "SELF-DISCOVER",
    "n": 12000,
    "phase1_accuracy_percent": 96.91666666666667,
    "accuracy_percent": 96.94166666666666,
    "macro_f1_percent": 96.93905928714422,
    "corrected": 52,
    "introduced": 49,
    "net_corrections": 3
  },
  {
    "dataset": "Reddit",
    "model": "Llama 3",
    "method": "CoT",
    "n": 12000,
    "phase1_accuracy_percent": 96.91666666666667,
    "accuracy_percent": 97.15,
    "macro_f1_percent": 97.14709383641275,
    "corrected": 63,
    "introduced": 35,
    "net_corrections": 28
  },
  {
    "dataset": "Reddit",
    "model": "Llama 3",
    "method": "Direct",
    "n": 12000,
    "phase1_accuracy_percent": 96.91666666666667,
    "accuracy_percent": 97.10833333333333,
    "macro_f1_percent": 97.10561517386319,
    "corrected": 68,
    "introduced": 45,
    "net_corrections": 23
  },
  {
    "dataset": "Reddit",
    "model": "Llama 3",
    "method": "SELF-DISCOVER",
    "n": 12000,
    "phase1_accuracy_percent": 96.91666666666667,
    "accuracy_percent": 97.2,
    "macro_f1_percent": 97.19902501721215,
    "corrected": 72,
    "introduced": 38,
    "net_corrections": 34
  }
];
window.studyMatrices = {
  "Reddit": {
    "labels": [
      "Depression",
      "Neutral",
      "Happy"
    ],
    "source": "results/predictions/reddit__llama3__self_discover.csv",
    "n": 12000,
    "phase1_label": [
      [
        3837,
        19,
        144
      ],
      [
        15,
        3952,
        33
      ],
      [
        127,
        32,
        3841
      ]
    ],
    "final_label": [
      [
        3851,
        24,
        125
      ],
      [
        13,
        3954,
        33
      ],
      [
        104,
        37,
        3859
      ]
    ]
  },
  "Mixed Emotion": {
    "labels": [
      "Depression",
      "Neutral",
      "Happy"
    ],
    "source": "results/predictions/mixed_emotion__llama3__self_discover.csv",
    "n": 300,
    "phase1_label": [
      [
        79,
        0,
        21
      ],
      [
        0,
        89,
        11
      ],
      [
        17,
        0,
        83
      ]
    ],
    "final_label": [
      [
        82,
        0,
        18
      ],
      [
        0,
        97,
        3
      ],
      [
        0,
        1,
        99
      ]
    ]
  },
  "Additional Reddit 9000": {
    "labels": [
      "Depression",
      "Neutral",
      "Happy"
    ],
    "source": "results/predictions/additional_reddit_9000__llama3__self_discover.csv",
    "n": 9000,
    "phase1_label": [
      [
        2884,
        7,
        109
      ],
      [
        10,
        2956,
        34
      ],
      [
        44,
        14,
        2942
      ]
    ],
    "final_label": [
      [
        2890,
        13,
        97
      ],
      [
        12,
        2959,
        29
      ],
      [
        36,
        14,
        2950
      ]
    ]
  }
};
