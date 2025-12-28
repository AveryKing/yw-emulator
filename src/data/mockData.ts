// src/data/mockData.ts

export const LOGIN_SEQUENCE = [
  // 1. Main Player Data (The "LogOK" packet)
  {
    hitNewUserDailyLoginLimit: false,
    settings: 0,
    isEmployee: false,
    throwableItemTypes: '["RED_SNOWBALL","WHITE_SNOWBALL","GREEN_SNOWBALL"]',
    sessionId: "188031551_1766706223", // Will be patched dynamically by controller
    speed: 0,
    pzone_edit_allowed: false,
    result: true,
    _cmd: "activatePlayer",
    subscriptionStatus: false,
    subscriptionPaymentOk: false,
    defaultZoneName: "h110456127",
    promosParticipated: [],
    playerId: 188031551, // Will be patched dynamically
    player: {
      inWelcomeParty: true,
      walkAction: 0,
      lastLogin: "2025-12-25 23:43:00.0",
      maxEquippable: 20,
      nextEquippableUpgrade: {
        cost: 1000,
        currency_type: 0,
        increase_by: 1,
        upgrade_slot: 1,
      },
      gender: 2,
      badgeId: 1,
      newUserFlagged: false,
      onlineStatus: 1,
      playerGroups: [],
      locale: "",
      createdOn: "2025-05-06 13:50:18.0",
      platform: "dotcom",
      followingPet: 0,
      entranceAction: 0,
      relationship_status: 0,
      dotcomLoginCount: 247,
      cash: 5000, // I gave you some extra cash for testing ;)
      playerId: 188031551,
      speechBalloonColor: "0",
      drunk_effect: "",
      idleAction: 0,
      firstTime: 0,
      money: 33875,
      mod_level: 0,
      name: "Guest",
      clothing: [], // Empty clothing is safe, or add items if you want
      tempAppearanceItems: {},
      energy: 100,
    },
  },

  // 2. Event Timer Data (Model 27) - Required for UI
  {
    _cmd: "ModelStore.modelResponse",
    m: {
      timeElapsed: 197023,
      eventTypeId: 1,
      modelID: 27,
      eventDetailsModel: { m: { modelID: 27 } },
      timeRemaining: 148567,
      definitionId: 573,
    },
  },

  // 3. Server Date/Time Data (Model 80)
  {
    _cmd: "ModelStore.modelResponse",
    m: { modelID: 80, dateOverride: 0 },
  },

  // 4. Quest Data (Model 32) - TRUNCATED VERSION
  // We only keep the first "Epic" (Storyline 1) to satisfy the client loader.
  {
    _cmd: "ModelStore.modelResponse",
    m: {
      modelID: 32,
      epics: [
        {
          maxProgression: 7,
          epicId: 17,
          activeQuests: [
            {
              questId: 686,
              requirements: [
                {
                  questId: 686,
                  subtype: "EQUIPPED_ITEM_THEME",
                  requirementId: 1768,
                  type: "QUEST_FINAL",
                  value: "",
                },
              ],
              epicId: 17,
              isBonus: false,
              rewardType: "QUEST_REWARD_UNSET",
              name: "1_1_1",
              description: "Put on 1 Clothing Item",
            },
          ],
          completionQuestId: 692,
          nextQuestStart: 0,
          name: "Storyline: 1, Chapter: 1",
          prereqEpicId: 0,
          lastQuestEnd: 0,
          storylineId: 1,
        },
      ],
    },
  },
];
