import express from 'express';
const router = express.Router();

console.log('Initializing pest router');

// Import mock pest data for demo purposes
const pestData = {
  'all': [
    {
      id: '1',
      name: 'Fall Armyworm',
      scientificName: 'Spodoptera frugiperda',
      affectedCrops: ['maize', 'rice', 'sorghum', 'millet'],
      symptoms: [
        'Irregular holes in leaves',
        'Window pane damage on leaves',
        'Sawdust-like frass in leaf whorls',
        'Damaged tassels and cobs'
      ],
      prevention: [
        'Early planting',
        'Intercropping with legumes',
        'Use of resistant varieties',
        'Regular field monitoring'
      ],
      treatment: [
        'Application of Bt sprays (Bacillus thuringiensis)',
        'Neem-based insecticides',
        'Chemical control with approved insecticides',
        'Release of natural enemies'
      ],
      image: 'https://via.placeholder.com/200x150?text=Fall+Armyworm',
      riskLevel: 'High'
    },
    {
      id: '2',
      name: 'Aphids',
      scientificName: 'Aphidoidea family',
      affectedCrops: ['tomato', 'beans', 'cabbage', 'cotton'],
      symptoms: [
        'Curled or twisted leaves',
        'Yellowing or stunting of plants',
        'Sticky honeydew on leaves',
        'Black sooty mold growth'
      ],
      prevention: [
        'Use of reflective mulches',
        'Companion planting with repellent plants',
        'Maintaining beneficial insects',
        'Avoid excess nitrogen fertilizer'
      ],
      treatment: [
        'Insecticidal soap applications',
        'Neem oil spray',
        'Introduction of ladybugs and lacewings',
        'Systemic insecticides for severe infestations'
      ],
      image: 'https://via.placeholder.com/200x150?text=Aphids',
      riskLevel: 'Medium'
    },
    {
      id: '3',
      name: 'Coffee Berry Borer',
      scientificName: 'Hypothenemus hampei',
      affectedCrops: ['coffee'],
      symptoms: [
        'Small holes in coffee berries',
        'Premature dropping of berries',
        'Tunnels inside coffee beans',
        'Reduced yield and quality'
      ],
      prevention: [
        'Regular field sanitation',
        'Pruning and proper spacing',
        'Complete harvesting of berries',
        'Use of traps with attractants'
      ],
      treatment: [
        'Biological control with Beauveria bassiana fungus',
        'Alcohol-based traps',
        'Selective insecticide application',
        'Post-harvest processing to kill remaining pests'
      ],
      image: 'https://via.placeholder.com/200x150?text=Coffee+Berry+Borer',
      riskLevel: 'High'
    },
    {
      id: '4',
      name: 'Tomato Blight',
      scientificName: 'Phytophthora infestans',
      affectedCrops: ['tomato', 'potato'],
      symptoms: [
        'Dark water-soaked spots on leaves',
        'White fuzzy growth under leaves',
        'Brown lesions on stems and fruits',
        'Rapid wilting and plant death'
      ],
      prevention: [
        'Use disease-resistant varieties',
        'Proper plant spacing for air circulation',
        'Avoid overhead irrigation',
        'Crop rotation with non-solanaceous crops'
      ],
      treatment: [
        'Copper-based fungicides',
        'Removal and destruction of infected plants',
        'Protective fungicide application before symptoms',
        'Organic options like copper octanoate'
      ],
      image: 'https://via.placeholder.com/200x150?text=Tomato+Blight',
      riskLevel: 'High'
    },
    {
      id: '5',
      name: 'Cassava Mosaic Disease',
      scientificName: 'Cassava mosaic geminiviruses',
      affectedCrops: ['cassava'],
      symptoms: [
        'Yellow mosaic pattern on leaves',
        'Leaf distortion and reduction',
        'Stunted plant growth',
        'Reduced root yield'
      ],
      prevention: [
        'Use of disease-free planting materials',
        'Planting resistant varieties',
        'Removing and destroying infected plants',
        'Control of whitefly vectors'
      ],
      treatment: [
        'No direct cure once infected',
        'Rogueing infected plants',
        'Whitefly control with insecticides',
        'Planting resistant varieties in affected areas'
      ],
      image: 'https://via.placeholder.com/200x150?text=Cassava+Mosaic',
      riskLevel: 'High'
    },
    {
      id: '6',
      name: 'Bean Fly',
      scientificName: 'Ophiomyia phaseoli',
      affectedCrops: ['beans', 'soybeans'],
      symptoms: [
        'Yellow leaves starting from bottom',
        'Swollen stems with feeding tunnels',
        'Wilting and death of young plants',
        'Reduced plant vigor and yield'
      ],
      prevention: [
        'Early planting at onset of rains',
        'Seed treatment before planting',
        'Deep plowing to bury pupae',
        'Crop rotation with non-legumes'
      ],
      treatment: [
        'Seed dressing with appropriate insecticides',
        'Foliar sprays of systemic insecticides',
        'Proper timing of insecticide application',
        'Destruction of crop residues after harvest'
      ],
      image: 'https://via.placeholder.com/200x150?text=Bean+Fly',
      riskLevel: 'Medium'
    },
    {
      id: '7',
      name: 'Rice Blast',
      scientificName: 'Magnaporthe oryzae',
      affectedCrops: ['rice'],
      symptoms: [
        'Diamond-shaped lesions on leaves',
        'Gray or white centers in lesions',
        'Infected panicles break at base',
        'Partial or complete grain sterility'
      ],
      prevention: [
        'Planting resistant varieties',
        'Balanced fertilizer application',
        'Proper water management',
        'Silicon application to strengthen cell walls'
      ],
      treatment: [
        'Fungicide application at early heading stage',
        'Triazole or strobilurin fungicides',
        'Burning infected crop residues',
        'Adjusting planting time to avoid favorable disease conditions'
      ],
      image: 'https://via.placeholder.com/200x150?text=Rice+Blast',
      riskLevel: 'High'
    },
    {
      id: '8',
      name: 'Maize Weevil',
      scientificName: 'Sitophilus zeamais',
      affectedCrops: ['maize', 'rice', 'wheat'],
      symptoms: [
        'Small holes in stored grains',
        'Powdery residue around grains',
        'Reduced grain weight',
        'Heating of stored grain'
      ],
      prevention: [
        'Drying grains properly before storage',
        'Use of hermetic storage bags',
        'Regular cleaning of storage facilities',
        'Early harvesting when possible'
      ],
      treatment: [
        'Fumigation with phosphine tablets',
        'Diatomaceous earth application',
        'Botanical insecticides like neem powder',
        'Freezing small quantities of grain'
      ],
      image: 'https://via.placeholder.com/200x150?text=Maize+Weevil',
      riskLevel: 'Medium'
    }
  ]
};

// Get common pests by crop type
router.get('/common-pests', (req, res) => {
  console.log('Common pests endpoint called');
  try {
    const { cropType } = req.query;
    
    // If specific crop is requested, filter the pests
    let pests = pestData['all'];
    
    if (cropType && cropType !== 'all') {
      pests = pests.filter(pest => 
        pest.affectedCrops.includes(cropType.toLowerCase())
      );
    }
    
    return res.json({
      success: true,
      pests: pests,
      count: pests.length
    });
  } catch (error) {
    console.error('Error in getting common pests:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get pest details by ID
router.get('/details/:pestId', (req, res) => {
  try {
    const { pestId } = req.params;
    const allPests = pestData['all'];
    
    const pest = allPests.find(p => p.id === pestId);
    
    if (!pest) {
      return res.status(404).json({
        success: false,
        message: 'Pest not found'
      });
    }
    
    return res.json({
      success: true,
      pest: pest
    });
  } catch (error) {
    console.error('Error in getting pest details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Assess pest risk based on location and crop type
router.get('/assess-risk', (req, res) => {
  try {
    const { lat, lon, cropType } = req.query;
    
    if (!lat || !lon || !cropType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }
    
    // For demo, generate random risk assessment
    const riskScore = Math.floor(Math.random() * 100);
    let riskLevel = 'Low';
    if (riskScore > 70) riskLevel = 'High';
    else if (riskScore > 40) riskLevel = 'Medium';
    
    // Get pests for the crop type
    let possiblePests = pestData['all'].filter(pest => 
      pest.affectedCrops.includes(cropType.toLowerCase())
    );
    
    // If no specific pests found, provide general ones
    if (possiblePests.length === 0) {
      possiblePests = pestData['all'].slice(0, 3);
    }
    
    // Sort by risk level
    possiblePests.sort((a, b) => {
      const riskValues = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return riskValues[b.riskLevel] - riskValues[a.riskLevel];
    });
    
    return res.json({
      success: true,
      riskAssessment: {
        overallRisk: {
          score: riskScore,
          level: riskLevel
        },
        location: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        },
        cropType: cropType,
        possibleThreats: possiblePests.slice(0, 3).map(pest => ({
          name: pest.name,
          scientificName: pest.scientificName,
          riskLevel: pest.riskLevel,
          symptoms: pest.symptoms.slice(0, 3)
        })),
        recommendations: [
          'Monitor fields regularly for early signs of pests',
          'Consider preventative measures during high-risk seasons',
          'Maintain field hygiene to reduce pest pressure'
        ]
      }
    });
  } catch (error) {
    console.error('Error in pest risk assessment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;
