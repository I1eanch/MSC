import { AppDataSource } from './data-source';
import { HabitTemplate } from './entities/habit-template.entity';
import { defaultHabitTemplates } from './seeds/habit-templates.seed';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized');

    const templateRepository = AppDataSource.getRepository(HabitTemplate);

    const existingCount = await templateRepository.count();

    if (existingCount > 0) {
      console.log('Templates already seeded. Skipping...');
      await AppDataSource.destroy();
      return;
    }

    console.log('Seeding habit templates...');

    for (const templateData of defaultHabitTemplates) {
      const template = templateRepository.create(templateData);
      await templateRepository.save(template);
      console.log(`- Created template: ${template.name}`);
    }

    console.log(`Successfully seeded ${defaultHabitTemplates.length} habit templates`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
