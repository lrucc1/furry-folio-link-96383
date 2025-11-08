import { supabase } from '@/integrations/supabase/client'

/**
 * Test script for creating pets with sample data
 * Usage: Import and call testCreatePet() from browser console
 */

export const samplePets = [
  {
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    sex: 'Male',
    date_of_birth: '2020-05-15',
    desexed: true,
    microchip_number: '123456789012345',
    registry_name: 'Pet Address',
    registry_link: 'https://petaddress.com.au',
    clinic_name: 'Happy Paws Vet Clinic',
    clinic_address: '123 Main St, Sydney NSW 2000',
    insurance_provider: 'PetSure',
    insurance_policy: 'POL-12345',
    notes: 'Loves tennis balls and swimming',
  },
  {
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    color: 'Grey',
    sex: 'Female',
    date_of_birth: '2021-03-20',
    desexed: true,
    microchip_number: '987654321098765',
    registry_name: 'Central Animal Records',
    notes: 'Indoor cat, loves catnip',
  },
  {
    name: 'Charlie',
    species: 'Dog',
    breed: 'Labrador',
    color: 'Black',
    sex: 'Male',
    date_of_birth: '2019-08-10',
    desexed: false,
    microchip_number: '456789012345678',
    clinic_name: 'City Vet Hospital',
    clinic_address: '456 Park Ave, Melbourne VIC 3000',
    notes: 'High energy, needs daily walks',
  },
]

export async function testCreatePet(petIndex = 0) {
  const pet = samplePets[petIndex] || samplePets[0]
  
  console.log('[TEST] Creating pet:', pet.name)
  
  try {
    const { data, error } = await supabase.functions.invoke('create-pet', {
      body: pet,
    })
    
    if (error) {
      console.error('[TEST] Error:', error)
      return { success: false, error }
    }
    
    console.log('[TEST] Success! Pet ID:', data.id)
    return { success: true, data }
  } catch (err) {
    console.error('[TEST] Exception:', err)
    return { success: false, error: err }
  }
}

export async function testCreateMultiplePets() {
  console.log('[TEST] Creating multiple pets...')
  
  for (let i = 0; i < samplePets.length; i++) {
    const result = await testCreatePet(i)
    console.log(`[TEST] Pet ${i + 1}/${samplePets.length}:`, result.success ? '✓' : '✗')
    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('[TEST] Done!')
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).testCreatePet = testCreatePet;
  (window as any).testCreateMultiplePets = testCreateMultiplePets;
  (window as any).samplePets = samplePets;
  console.log('✅ Pet test functions loaded! Use in console:');
  console.log('  testCreatePet(0) - Create first sample pet');
  console.log('  testCreatePet(1) - Create second sample pet');
  console.log('  testCreateMultiplePets() - Create all sample pets');
}
