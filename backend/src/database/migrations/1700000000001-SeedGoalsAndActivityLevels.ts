import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGoalsAndActivityLevels1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO goals (id, name, description, "displayOrder") VALUES
      (uuid_generate_v4(), 'Weight Loss', 'Focus on losing weight and reducing body fat', 1),
      (uuid_generate_v4(), 'Muscle Gain', 'Build muscle mass and increase strength', 2),
      (uuid_generate_v4(), 'Improved Endurance', 'Enhance cardiovascular fitness and stamina', 3),
      (uuid_generate_v4(), 'Flexibility', 'Improve flexibility and range of motion', 4),
      (uuid_generate_v4(), 'General Fitness', 'Maintain overall health and wellness', 5),
      (uuid_generate_v4(), 'Sports Performance', 'Enhance performance for specific sports', 6),
      (uuid_generate_v4(), 'Stress Relief', 'Use exercise to manage stress and improve mental health', 7),
      (uuid_generate_v4(), 'Rehabilitation', 'Recover from injury or medical condition', 8)
      ON CONFLICT (name) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO activity_levels (id, name, description, "displayOrder") VALUES
      (uuid_generate_v4(), 'Sedentary', 'Little or no exercise, desk job', 1),
      (uuid_generate_v4(), 'Lightly Active', 'Light exercise or sports 1-3 days per week', 2),
      (uuid_generate_v4(), 'Moderately Active', 'Moderate exercise or sports 3-5 days per week', 3),
      (uuid_generate_v4(), 'Very Active', 'Hard exercise or sports 6-7 days per week', 4),
      (uuid_generate_v4(), 'Extremely Active', 'Very hard exercise, physical job, or training twice per day', 5)
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM goals WHERE name IN (
      'Weight Loss', 'Muscle Gain', 'Improved Endurance', 'Flexibility',
      'General Fitness', 'Sports Performance', 'Stress Relief', 'Rehabilitation'
    )`);

    await queryRunner.query(`DELETE FROM activity_levels WHERE name IN (
      'Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'
    )`);
  }
}
