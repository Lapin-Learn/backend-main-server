UPDATE question_types
SET band_score_requires = '[
  {
    "bandScore": "pre_ielts",
    "requireXP": 500,
    "jumpBandPercentage": 0.5
  },
  {
    "bandScore": "4.5",
    "requireXP": 500,
    "jumpBandPercentage": 0.6
  },
  {
    "bandScore": "5.0",
    "requireXP": 500,
    "jumpBandPercentage": 0.7
  },
  {
    "bandScore": "5.5",
    "requireXP": 500,
    "jumpBandPercentage": 0.8
  },
  {
    "bandScore": "6.0",
    "requireXP": 500,
    "jumpBandPercentage": 0.9
  },
  {
    "bandScore": "6.5",
    "requireXP": 500,
    "jumpBandPercentage": 1
  },
  {
    "bandScore": "7.0",
    "requireXP": 500,
    "jumpBandPercentage": 1
  }
]'