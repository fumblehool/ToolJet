import { MigrationInterface, QueryRunner } from 'typeorm';
import { InstanceSettings } from 'src/entities/instance_settings.entity';

export class BackfillInstanceSettingsColumns1682045191971 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const entityManager = queryRunner.manager;
    const instanceSettingsRepository = entityManager.getRepository(InstanceSettings);

    await instanceSettingsRepository.update(
      { key: 'ALLOW_PERSONAL_WORKSPACE' },
      {
        label: 'Allow Personal Workspace',
        labelKey: 'header.organization.menus.manageSSO.generalSettings.allowPersonalWorkspace',
        dataType: 'boolean',
        helperText: 'This feature will enable users to create their own workspace',
        helperTextKey: 'header.organization.menus.manageSSO.generalSettings.allowPersonalWorkspaceDetails',
      }
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}