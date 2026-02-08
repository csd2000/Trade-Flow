import { Request, Response } from 'express';
import { trainingSeeder } from '../../admin-seed';

export async function seedTrainingContent(req: Request, res: Response) {
  try {
    console.log('🌱 Manual training seed requested...');
    
    await trainingSeeder.seedAllTrainingContent();
    
    res.json({ 
      success: true, 
      message: 'All training content seeded successfully' 
    });
  } catch (error: any) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({ 
      error: 'Seeding failed', 
      message: error?.message || 'Unknown error' 
    });
  }
}