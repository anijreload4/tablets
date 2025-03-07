[
    /* EXODUS EPOCH - LEVEL 1: "BRICKS WITHOUT STRAW" */
    {
      "id": "exodus-1-intro",
      "level": 1,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "EgyptianTaskmaster",
          "text": "Pharaoh commands more bricks! And now, gather your own straw. The quota remains the same!",
          "emotion": "stern",
          "scriptureReference": "Exodus 5:7"
        },
        {
          "character": "IsraeliteWorker",
          "text": "How can we make the same number of bricks when we must now gather straw ourselves? This burden is too great!",
          "emotion": "weary"
        },
        {
          "character": "Moses",
          "text": "I see your suffering. The cruelty of the Egyptians grows worse each day.",
          "emotion": "concerned"
        },
        {
          "character": "Aaron",
          "text": "The people's strength fails them. Their spirits break under this hardship.",
          "emotion": "supportive"
        }
      ]
    },
    {
      "id": "exodus-1-brick-clearing",
      "level": 1,
      "epoch": "exodus",
      "triggerType": "obstacleCleared",
      "obstacleType": "brick",
      "count": 3,
      "priority": 5,
      "lines": [
        {
          "character": "IsraeliteFather",
          "text": "My hands are raw from making bricks without proper straw. How much longer must we endure this?",
          "emotion": "suffering"
        },
        {
          "character": "Moses",
          "text": "The Lord has seen your affliction. He has heard your groaning. The time of deliverance draws near.",
          "emotion": "reassuring",
          "scriptureReference": "Exodus 2:24-25"
        }
      ]
    },
    {
      "id": "exodus-1-faith-meter",
      "level": 1,
      "epoch": "exodus",
      "triggerType": "faithMeterProgress",
      "progress": 0.5,
      "priority": 6,
      "lines": [
        {
          "character": "IsraeliteElder",
          "text": "Our people lose hope with each passing day. The taskmasters become more cruel.",
          "emotion": "despairing"
        },
        {
          "character": "Miriam",
          "text": "We must hold to the promise made to our fathers Abraham, Isaac, and Jacob. The God who sees our suffering will deliver us.",
          "emotion": "faithful",
          "scriptureReference": "Exodus 2:24"
        }
      ]
    },
    {
      "id": "exodus-1-complete",
      "level": 1,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "Moses",
          "text": "I will speak to Pharaoh again. The Lord our God commands him to let our people go.",
          "emotion": "determined",
          "scriptureReference": "Exodus 5:1"
        },
        {
          "character": "Aaron",
          "text": "I will go with you, brother. The Lord has chosen me to be your voice.",
          "emotion": "supportive",
          "scriptureReference": "Exodus 4:14-16"
        },
        {
          "character": "IsraeliteElder",
          "text": "May the God of our fathers be with you as you stand before Pharaoh.",
          "emotion": "hopeful"
        }
      ]
    },
  
    /* EXODUS EPOCH - LEVEL 2: "THE PLAGUES BEGIN" */
    {
      "id": "exodus-2-intro",
      "level": 2,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "Pharaoh",
          "text": "Who is the LORD that I should obey His voice to let Israel go? I do not know the LORD, nor will I let Israel go!",
          "emotion": "defiant",
          "scriptureReference": "Exodus 5:2"
        },
        {
          "character": "Moses",
          "text": "Thus says the LORD God of Israel: By this you shall know that I am the LORD. I will strike the waters of the river with the rod in my hand, and they shall turn to blood.",
          "emotion": "commanding",
          "scriptureReference": "Exodus 7:17"
        },
        {
          "character": "Aaron",
          "text": "All the waters of Egypt shall be turned to blood, and there shall be no water to drink.",
          "emotion": "solemn",
          "scriptureReference": "Exodus 7:19"
        },
        {
          "character": "EgyptianOfficial",
          "text": "Our magicians can do the same! Pharaoh's heart remains hard. He will not listen.",
          "emotion": "dismissive",
          "scriptureReference": "Exodus 7:22"
        }
      ]
    },
    {
      "id": "exodus-2-blood-water-conversion",
      "level": 2,
      "epoch": "exodus",
      "triggerType": "tileConverted",
      "fromType": "bloodWater",
      "toType": "water",
      "count": 5,
      "priority": 5,
      "lines": [
        {
          "character": "IsraeliteMother",
          "text": "The Egyptians are digging along the river for water to drink, because they cannot drink from the Nile.",
          "emotion": "observant",
          "scriptureReference": "Exodus 7:24"
        },
        {
          "character": "EgyptianServant",
          "text": "Seven days have passed since the LORD struck the Nile. How many more plagues will come upon us?",
          "emotion": "worried",
          "scriptureReference": "Exodus 7:25"
        }
      ]
    },
    {
      "id": "exodus-2-special-match",
      "level": 2,
      "epoch": "exodus",
      "triggerType": "specialMatch",
      "matchType": "4-in-a-row",
      "priority": 6,
      "lines": [
        {
          "character": "Moses",
          "text": "If Pharaoh refuses to let the people go, the LORD will send swarms of frogs that will cover the land of Egypt.",
          "emotion": "warning",
          "scriptureReference": "Exodus 8:2-4"
        },
        {
          "character": "EgyptianOfficial",
          "text": "First blood, now frogs, then gnats and flies! Each plague is worse than the one before!",
          "emotion": "dismayed"
        }
      ]
    },
    {
      "id": "exodus-2-complete",
      "level": 2,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "Pharaoh",
          "text": "I will let you go to sacrifice to your God in the wilderness, only you shall not go very far away. Entreat for me that these plagues may depart.",
          "emotion": "reluctant",
          "scriptureReference": "Exodus 8:28"
        },
        {
          "character": "Moses",
          "text": "Pharaoh's heart has hardened again. He will not keep his promise.",
          "emotion": "knowing",
          "scriptureReference": "Exodus 8:32"
        },
        {
          "character": "Aaron",
          "text": "The LORD will continue to show His power until Pharaoh releases our people.",
          "emotion": "resolute"
        },
        {
          "character": "IsraeliteElder",
          "text": "How many more signs must the LORD perform before Pharaoh understands that the God of Israel is the one true God?",
          "emotion": "wondering"
        }
      ]
    },
  
    /* EXODUS EPOCH - LEVEL 3: "CROSSING THE RED SEA" */
    {
      "id": "exodus-3-intro",
      "level": 3,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "IsraeliteMother",
          "text": "The sea blocks our path! And look—Pharaoh's army approaches from behind!",
          "emotion": "fearful"
        },
        {
          "character": "IsraeliteElder",
          "text": "Were there no graves in Egypt, that you have taken us to die in the wilderness? Why have you dealt with us like this?",
          "emotion": "angry",
          "scriptureReference": "Exodus 14:11"
        },
        {
          "character": "Moses",
          "text": "Do not be afraid. Stand still, and see the salvation of the LORD. The Egyptians whom you see today, you shall see again no more forever.",
          "emotion": "commanding",
          "scriptureReference": "Exodus 14:13"
        },
        {
          "character": "Miriam",
          "text": "Trust in the Lord. He who delivered us from slavery will not abandon us now.",
          "emotion": "faithful"
        }
      ]
    },
    {
      "id": "exodus-3-path-halfway",
      "level": 3,
      "epoch": "exodus",
      "triggerType": "pathProgress",
      "progress": 0.5,
      "priority": 6,
      "lines": [
        {
          "character": "IsraeliteChild",
          "text": "Look! The waters are parting! A path appears through the sea!",
          "emotion": "amazed"
        },
        {
          "character": "IsraeliteFather",
          "text": "I cannot believe my eyes. The sea stands like walls on either side!",
          "emotion": "astonished",
          "scriptureReference": "Exodus 14:22"
        },
        {
          "character": "EgyptianCommander",
          "text": "Pharaoh commands us to pursue them! Follow them into the sea!",
          "emotion": "determined",
          "scriptureReference": "Exodus 14:23"
        }
      ]
    },
    {
      "id": "exodus-3-staff-creation",
      "level": 3,
      "epoch": "exodus",
      "triggerType": "specialTileCreated",
      "tileType": "staff",
      "priority": 7,
      "lines": [
        {
          "character": "Moses",
          "text": "The LORD said to me, 'Lift up your rod, and stretch out your hand over the sea and divide it.'",
          "emotion": "faithful",
          "scriptureReference": "Exodus 14:16"
        },
        {
          "character": "Aaron",
          "text": "The LORD is fighting for Israel against the Egyptians!",
          "emotion": "amazed",
          "scriptureReference": "Exodus 14:25"
        }
      ]
    },
    {
      "id": "exodus-3-staff-activation",
      "level": 3,
      "epoch": "exodus",
      "triggerType": "powerupActivated",
      "powerupType": "staff",
      "priority": 7,
      "lines": [
        {
          "character": "Moses",
          "text": "By the power of the Lord, the waters are held back!",
          "emotion": "powerful"
        },
        {
          "character": "Miriam",
          "text": "See how the Lord makes a path through the mighty waters!",
          "emotion": "faithful",
          "scriptureReference": "Exodus 14:21-22"
        }
      ]
    },
    {
      "id": "exodus-3-complete",
      "level": 3,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "Moses",
          "text": "Stretch out your hand over the sea, that the waters may come back upon the Egyptians, on their chariots, and on their horsemen.",
          "emotion": "commanding",
          "scriptureReference": "Exodus 14:26"
        },
        {
          "character": "EgyptianSoldier",
          "text": "Let us flee from the face of Israel, for the LORD fights for them against Egypt!",
          "emotion": "terrified",
          "scriptureReference": "Exodus 14:25"
        },
        {
          "character": "Miriam",
          "text": "Sing to the LORD, for He has triumphed gloriously! The horse and its rider He has thrown into the sea!",
          "emotion": "joyful",
          "scriptureReference": "Exodus 15:21"
        },
        {
          "character": "IsraelitePeople",
          "text": "The LORD is my strength and song, and He has become my salvation!",
          "emotion": "celebrating",
          "scriptureReference": "Exodus 15:2"
        }
      ]
    },
  
    /* EXODUS EPOCH - LEVEL 4: "THE WILDERNESS PATH" */
    {
      "id": "exodus-4-intro",
      "level": 4,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "Moses",
          "text": "The LORD has brought us through the Red Sea. Now we journey into the Wilderness of Shur.",
          "emotion": "leading",
          "scriptureReference": "Exodus 15:22"
        },
        {
          "character": "IsraeliteYouth",
          "text": "Three days we have traveled in the wilderness and found no water. The little we carried from Egypt is nearly gone.",
          "emotion": "concerned",
          "scriptureReference": "Exodus 15:22"
        },
        {
          "character": "IsraeliteElder",
          "text": "The celebration of our deliverance fades as thirst grows. What shall we drink?",
          "emotion": "worried"
        },
        {
          "character": "Miriam",
          "text": "The God who parted the sea will provide water in the desert. We must trust and move forward.",
          "emotion": "encouraging"
        }
      ]
    },
    {
      "id": "exodus-4-shifting-sand",
      "level": 4,
      "epoch": "exodus",
      "triggerType": "specialMechanic",
      "mechanicId": "sandShift",
      "priority": 6,
      "lines": [
        {
          "character": "IsraeliteChild",
          "text": "The sand shifts beneath our feet! It is hard to find our way.",
          "emotion": "confused"
        },
        {
          "character": "Aaron",
          "text": "The wilderness is treacherous and ever-changing. We must follow the pillar of cloud by day and the pillar of fire by night.",
          "emotion": "instructing",
          "scriptureReference": "Exodus 13:21-22"
        }
      ]
    },
    {
      "id": "exodus-4-water-match",
      "level": 4,
      "epoch": "exodus",
      "triggerType": "matchTiles",
      "tileType": "water",
      "count": 4,
      "priority": 5,
      "lines": [
        {
          "character": "IsraeliteMother",
          "text": "Our water pouches are nearly empty. We must find water soon or the children will suffer.",
          "emotion": "anxious"
        },
        {
          "character": "Moses",
          "text": "The Lord will test our faith in this wilderness, but He will also provide. We must look to Him for our needs.",
          "emotion": "faithful",
          "scriptureReference": "Exodus 15:25"
        }
      ]
    },
    {
      "id": "exodus-4-complete",
      "level": 4,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "IsraeliteElder",
          "text": "Look ahead! We have reached Elim, where there are twelve springs and seventy palm trees!",
          "emotion": "relieved",
          "scriptureReference": "Exodus 15:27"
        },
        {
          "character": "IsraeliteChild",
          "text": "Water! So much water! And shade from the sun!",
          "emotion": "joyful"
        },
        {
          "character": "Moses",
          "text": "The Lord has provided for us, as He promised. Let us camp here by the water.",
          "emotion": "grateful",
          "scriptureReference": "Exodus 15:27"
        },
        {
          "character": "Aaron",
          "text": "Twelve springs—one for each tribe of Israel. See how the Lord remembers His covenant with all the children of Jacob.",
          "emotion": "amazed"
        }
      ]
    },
  
    /* EXODUS EPOCH - LEVEL 5: "BITTER WATERS MADE SWEET" */
    {
      "id": "exodus-5-intro",
      "level": 5,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "IsraeliteFather",
          "text": "We have found water at Marah, but it is bitter! We cannot drink it!",
          "emotion": "disappointed",
          "scriptureReference": "Exodus 15:23"
        },
        {
          "character": "IsraelitePeople",
          "text": "What shall we drink? Moses, why have you brought us here?",
          "emotion": "complaining",
          "scriptureReference": "Exodus 15:24"
        },
        {
          "character": "Moses",
          "text": "I will cry out to the LORD. He who brought us through the sea will not let us die of thirst.",
          "emotion": "resolute",
          "scriptureReference": "Exodus 15:25"
        },
        {
          "character": "God",
          "text": "Take that tree branch and throw it into the waters.",
          "emotion": "commanding",
          "scriptureReference": "Exodus 15:25"
        }
      ]
    },
    {
      "id": "exodus-5-bitter-water",
      "level": 5,
      "epoch": "exodus",
      "triggerType": "specialMechanic",
      "mechanicId": "bitterWater",
      "priority": 6,
      "lines": [
        {
          "character": "IsraeliteChild",
          "text": "The water looks good, but it tastes terrible! My throat burns!",
          "emotion": "suffering"
        },
        {
          "character": "Aaron",
          "text": "Moses has gone to pray. The Lord will show him what to do.",
          "emotion": "reassuring"
        }
      ]
    },
    {
      "id": "exodus-5-water-conversion",
      "level": 5,
      "epoch": "exodus",
      "triggerType": "tileConverted",
      "fromType": "bitterWater",
      "toType": "water",
      "count": 5,
      "priority": 7,
      "lines": [
        {
          "character": "Moses",
          "text": "See! When the wood touches the bitter water, it becomes sweet and good to drink!",
          "emotion": "amazed",
          "scriptureReference": "Exodus 15:25"
        },
        {
          "character": "IsraeliteElder",
          "text": "Another miracle! The Lord has made the bitter waters sweet!",
          "emotion": "grateful"
        }
      ]
    },
    {
      "id": "exodus-5-complete",
      "level": 5,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "God",
          "text": "If you diligently heed the voice of the LORD your God and do what is right in His sight, I will put none of the diseases on you which I brought on the Egyptians.",
          "emotion": "instructing",
          "scriptureReference": "Exodus 15:26"
        },
        {
          "character": "Moses",
          "text": "The Lord has given us a statute and a law, and tested us here at Marah.",
          "emotion": "teaching",
          "scriptureReference": "Exodus 15:25"
        },
        {
          "character": "Miriam",
          "text": "Just as the Lord made these bitter waters sweet, He can transform the bitterness in our hearts when we trust in Him.",
          "emotion": "insightful"
        },
        {
          "character": "IsraelitePeople",
          "text": "The LORD is our healer!",
          "emotion": "worshipful",
          "scriptureReference": "Exodus 15:26"
        }
      ]
    },
  
    /* EXODUS EPOCH - LEVEL 6: "MANNA FROM HEAVEN" */
    {
      "id": "exodus-6-intro",
      "level": 6,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "IsraelitePeople",
          "text": "If only we had died by the LORD's hand in Egypt! There we had pots of meat and ate bread to the full. You have brought us into this desert to starve us all to death!",
          "emotion": "complaining",
          "scriptureReference": "Exodus 16:3"
        },
        {
          "character": "Moses",
          "text": "The LORD has heard your grumbling. At twilight you will eat meat, and in the morning you will be filled with bread. Then you will know that He is the LORD your God.",
          "emotion": "commanding",
          "scriptureReference": "Exodus 16:12"
        },
        {
          "character": "Aaron",
          "text": "Come before the LORD, for He has heard your complaints against Him.",
          "emotion": "supportive",
          "scriptureReference": "Exodus 16:9"
        },
        {
          "character": "IsraeliteElder",
          "text": "Look toward the wilderness! The glory of the LORD appears in the cloud!",
          "emotion": "amazed",
          "scriptureReference": "Exodus 16:10"
        }
      ]
    },
    {
      "id": "exodus-6-manna-appears",
      "level": 6,
      "epoch": "exodus",
      "triggerType": "specialMechanic",
      "mechanicId": "mannaFalling",
      "priority": 8,
      "lines": [
        {
          "character": "IsraeliteChild",
          "text": "Look! When the dew lifted, there is a small round substance on the ground as fine as frost!",
          "emotion": "amazed",
          "scriptureReference": "Exodus 16:14"
        },
        {
          "character": "IsraelitePeople",
          "text": "Man hu? (What is it?) We don't know what this is!",
          "emotion": "curious",
          "scriptureReference": "Exodus 16:15"
        },
        {
          "character": "Moses",
          "text": "This is the bread which the LORD has given you to eat. Gather it, everyone according to his need.",
          "emotion": "instructing",
          "scriptureReference": "Exodus 16:15-16"
        }
      ]
    },
    {
      "id": "exodus-6-manna-collection",
      "level": 6,
      "epoch": "exodus",
      "triggerType": "matchTiles",
      "tileType": "manna",
      "count": 5,
      "priority": 5,
      "repeatable": true,
      "cooldown": 30000,
      "lines": [
        {
          "character": "IsraeliteMother",
          "text": "We must gather an omer for each person in our tent, according to Moses' instruction.",
          "emotion": "determined",
          "scriptureReference": "Exodus 16:16"
        },
        {
          "character": "IsraeliteFather",
          "text": "Some gathered much, some little, yet when measured, those who gathered much did not have too much, and those who gathered little did not have too little.",
          "emotion": "amazed",
          "scriptureReference": "Exodus 16:17-18"
        }
      ]
    },
    {
      "id": "exodus-6-manna-timed",
      "level": 6,
      "epoch": "exodus",
      "triggerType": "timeRemaining",
      "seconds": 60,
      "priority": 7,
      "lines": [
        {
          "character": "Moses",
          "text": "Let no one leave any of it till morning. When the sun grows hot, it will melt away.",
          "emotion": "commanding",
          "scriptureReference": "Exodus 16:19-21"
        },
        {
          "character": "IsraeliteYouth",
          "text": "We must gather quickly! The manna disappears when the sun grows hot!",
          "emotion": "urgent"
        }
      ]
    },
    {
      "id": "exodus-6-complete",
      "level": 6,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "Moses",
          "text": "On the sixth day, gather twice as much, for tomorrow is the Sabbath, a day of rest holy to the LORD.",
          "emotion": "instructing",
          "scriptureReference": "Exodus 16:23"
        },
        {
          "character": "Aaron",
          "text": "The LORD provides double on the sixth day so that you may rest on the seventh. See how the LORD has given you the Sabbath.",
          "emotion": "teaching",
          "scriptureReference": "Exodus 16:29"
        },
        {
          "character": "IsraeliteMother",
          "text": "The manna tastes like wafers made with honey. Our children are no longer hungry!",
          "emotion": "grateful",
          "scriptureReference": "Exodus 16:31"
        },
        {
          "character": "Moses",
          "text": "This is the bread that the LORD has given you to eat. We must keep an omer of it for future generations to see.",
          "emotion": "reflective",
          "scriptureReference": "Exodus 16:32"
        }
      ]
    },
  
    /* EXODUS EPOCH - LEVEL 7: "COMPLAINING IN THE DESERT" */
    {
      "id": "exodus-7-intro",
      "level": 7,
      "epoch": "exodus",
      "triggerType": "levelStart",
      "priority": 10,
      "lines": [
        {
          "character": "IsraelitePeople",
          "text": "Give us water to drink! Why did you bring us up out of Egypt to kill us and our children and our livestock with thirst?",
          "emotion": "angry",
          "scriptureReference": "Exodus 17:2-3"
        },
        {
          "character": "Moses",
          "text": "Why do you contend with me? Why do you tempt the LORD?",
          "emotion": "frustrated",
          "scriptureReference": "Exodus 17:2"
        },
        {
          "character": "IsraeliteFather",
          "text": "Our water skins are empty, and there is no stream or well in sight. We will die in this wilderness!",
          "emotion": "desperate"
        },
        {
          "character": "Moses",
          "text": "Lord, what shall I do with this people? They are almost ready to stone me!",
          "emotion": "pleading",
          "scriptureReference": "Exodus 17:4"
        }
      ]
    },
    {
      "id": "exodus-7-water-threshold",
      "level": 7,
      "epoch": "exodus",
      "triggerType": "waterLevelLow",
      "threshold": 0.25,
      "priority": 8,
      "lines": [
        {
          "character": "IsraeliteElder",
          "text": "Our water is nearly gone! The children and the elderly will suffer first.",
          "emotion": "alarmed"
        },
        {
          "character": "Aaron",
          "text": "Moses has gone to seek guidance from the LORD. We must be patient.",
          "emotion": "calming"
        }
      ]
    },
    {
      "id": "exodus-7-water-match",
      "level": 7,
      "epoch": "exodus",
      "triggerType": "matchTiles",
      "tileType": "water",
      "count": 4,
      "priority": 5,
      "repeatable": true,
      "cooldown": 30000,
      "lines": [
        {
          "character": "IsraeliteMother",
          "text": "We must share what little water we have. The weak and young must drink first.",
          "emotion": "caring"
        },
        {
          "character": "IsraeliteChild",
          "text": "Is the God who brought us through the Red Sea unable to give us water?",
          "emotion": "questioning"
        }
      ]
    },
    {
      "id": "exodus-7-complete",
      "level": 7,
      "epoch": "exodus",
      "triggerType": "levelComplete",
      "priority": 10,
      "lines": [
        {
          "character": "God",
          "text": "Behold, I will stand before you there on the rock in Horeb; and you shall strike the rock, and water will come out of it, that the people may drink.",
          "emotion": "merciful",
          "scriptureReference": "Exodus 17:6"
        },
        {
          "character": "Moses",
          "text": "Elders of Israel, come and witness what the LORD will do!",
          "emotion": "commanding",
          "scriptureReference": "Exodus 17:5"
        },
        {
          "character": "IsraelitePeople",
          "text": "Water from the rock! A river in the desert! How great is our God!",
          "emotion": "amazed",
          "scriptureReference": "Exodus 17:6"
        },
        {
          "character": "Moses",
          "text": "This place shall be called Massah and Meribah, because of the contention of the children of Israel, and because they tempted the LORD.",
          "emotion": "solemn",
          "scriptureReference": "Exodus 17:7"
        },
        [
            /* EXODUS EPOCH - LEVEL 8: "BATTLE WITH AMALEK" */
            {
              "id": "exodus-8-intro",
              "level": 8,
              "epoch": "exodus",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "Joshua",
                  "text": "Moses, the Amalekites have come to fight against Israel at Rephidim!",
                  "emotion": "urgent",
                  "scriptureReference": "Exodus 17:8"
                },
                {
                  "character": "Moses",
                  "text": "Choose men for us, and go out, fight with Amalek. Tomorrow I will stand on the top of the hill with the rod of God in my hand.",
                  "emotion": "commanding",
                  "scriptureReference": "Exodus 17:9"
                },
                {
                  "character": "Joshua",
                  "text": "I will lead our men into battle as you command. May the Lord give us victory!",
                  "emotion": "determined",
                  "scriptureReference": "Exodus 17:10"
                },
                {
                  "character": "IsraeliteElder",
                  "text": "Our people are not warriors! How shall we defeat these desert fighters who attack our rear guard?",
                  "emotion": "fearful",
                  "scriptureReference": "Deuteronomy 25:18"
                }
              ]
            },
            {
              "id": "exodus-8-hands-meter",
              "level": 8,
              "epoch": "exodus",
              "triggerType": "specialMechanic",
              "mechanicId": "handsLowering",
              "priority": 7,
              "lines": [
                {
                  "character": "Aaron",
                  "text": "Moses' hands grow heavy! When his hands lower, Amalek prevails against our people!",
                  "emotion": "concerned",
                  "scriptureReference": "Exodus 17:11"
                },
                {
                  "character": "Hur",
                  "text": "We must support his hands until sunset. Come, Aaron, let us help him!",
                  "emotion": "supportive",
                  "scriptureReference": "Exodus 17:12"
                }
              ]
            },
            {
              "id": "exodus-8-staff-match",
              "level": 8,
              "epoch": "exodus",
              "triggerType": "matchTiles",
              "tileType": "staff",
              "count": 3,
              "priority": 5,
              "repeatable": true,
              "cooldown": 30000,
              "lines": [
                {
                  "character": "Moses",
                  "text": "My strength fails, but I must keep the rod of God raised high!",
                  "emotion": "struggling",
                  "scriptureReference": "Exodus 17:11"
                },
                {
                  "character": "Aaron",
                  "text": "Look! When Moses' hands are steady, Joshua and our men overcome the Amalekites!",
                  "emotion": "observant",
                  "scriptureReference": "Exodus 17:11"
                }
              ]
            },
            {
              "id": "exodus-8-complete",
              "level": 8,
              "epoch": "exodus",
              "triggerType": "levelComplete",
              "priority": 10,
              "lines": [
                {
                  "character": "Joshua",
                  "text": "Victory! The Lord has given us victory over Amalek by the edge of the sword!",
                  "emotion": "triumphant",
                  "scriptureReference": "Exodus 17:13"
                },
                {
                  "character": "Moses",
                  "text": "Write this for a memorial in the book and recount it to Joshua: I will utterly blot out the remembrance of Amalek from under heaven.",
                  "emotion": "solemn",
                  "scriptureReference": "Exodus 17:14"
                },
                {
                  "character": "Hur",
                  "text": "Your hands remained steady until the going down of the sun. The Lord fought for Israel today!",
                  "emotion": "amazed",
                  "scriptureReference": "Exodus 17:12"
                },
                {
                  "character": "Moses",
                  "text": "I will build an altar here and call it 'The-LORD-Is-My-Banner'. The LORD has sworn: the LORD will have war with Amalek from generation to generation.",
                  "emotion": "resolute",
                  "scriptureReference": "Exodus 17:15-16"
                }
              ]
            },
          
            /* EXODUS EPOCH - LEVEL 9: "ARRIVAL AT SINAI" */
            {
              "id": "exodus-9-intro",
              "level": 9,
              "epoch": "exodus",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "Moses",
                  "text": "In the third month after Israel left Egypt, we have come to the Wilderness of Sinai. Here we will camp before the mountain of God.",
                  "emotion": "reverent",
                  "scriptureReference": "Exodus 19:1-2"
                },
                {
                  "character": "God",
                  "text": "Thus you shall say to the house of Jacob: 'You have seen what I did to the Egyptians, and how I bore you on eagles' wings and brought you to Myself.'",
                  "emotion": "majestic",
                  "scriptureReference": "Exodus 19:3-4"
                },
                {
                  "character": "Moses",
                  "text": "If you will indeed obey My voice and keep My covenant, then you shall be a special treasure to Me above all people; for all the earth is Mine.",
                  "emotion": "teaching",
                  "scriptureReference": "Exodus 19:5"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "All that the LORD has spoken we will do!",
                  "emotion": "committed",
                  "scriptureReference": "Exodus 19:8"
                }
              ]
            },
            {
              "id": "exodus-9-mountain-climbing",
              "level": 9,
              "epoch": "exodus",
              "triggerType": "specialMechanic",
              "mechanicId": "mountainClimb",
              "priority": 7,
              "lines": [
                {
                  "character": "Moses",
                  "text": "Consecrate yourselves and wash your garments. Be ready for the third day, for the LORD will come down upon Mount Sinai in the sight of all the people.",
                  "emotion": "commanding",
                  "scriptureReference": "Exodus 19:10-11"
                },
                {
                  "character": "IsraeliteElder",
                  "text": "Take heed! Do not go up to the mountain or touch its base. Whoever touches the mountain shall surely be put to death.",
                  "emotion": "warning",
                  "scriptureReference": "Exodus 19:12"
                }
              ]
            },
            {
              "id": "exodus-9-thunder",
              "level": 9,
              "epoch": "exodus",
              "triggerType": "obstacleEncountered",
              "obstacleType": "thunder",
              "priority": 6,
              "lines": [
                {
                  "character": "IsraelitePeople",
                  "text": "The thunder roars and lightning flashes! The whole mountain trembles greatly!",
                  "emotion": "terrified",
                  "scriptureReference": "Exodus 19:16-18"
                },
                {
                  "character": "Moses",
                  "text": "Do not fear; for God has come to test you, and that His fear may be before you, so that you may not sin.",
                  "emotion": "reassuring",
                  "scriptureReference": "Exodus 20:20"
                }
              ]
            },
            {
              "id": "exodus-9-fire-collection",
              "level": 9,
              "epoch": "exodus",
              "triggerType": "matchTiles",
              "tileType": "fire",
              "count": 4,
              "priority": 5,
              "lines": [
                {
                  "character": "Aaron",
                  "text": "The mountain burns with fire to the midst of heaven—darkness, cloud, and thick darkness!",
                  "emotion": "awestruck",
                  "scriptureReference": "Deuteronomy 4:11"
                },
                {
                  "character": "IsraeliteYouth",
                  "text": "The voice of God speaks from the midst of the fire! Yet we live!",
                  "emotion": "amazed",
                  "scriptureReference": "Deuteronomy 4:33"
                }
              ]
            },
            {
              "id": "exodus-9-complete",
              "level": 9,
              "epoch": "exodus",
              "triggerType": "levelComplete",
              "priority": 10,
              "lines": [
                {
                  "character": "God",
                  "text": "I am the LORD your God, who brought you out of the land of Egypt, out of the house of bondage. You shall have no other gods before Me.",
                  "emotion": "commanding",
                  "scriptureReference": "Exodus 20:2-3"
                },
                {
                  "character": "Moses",
                  "text": "The LORD has declared His covenant. These Ten Commandments He has written with His own finger on tablets of stone.",
                  "emotion": "reverent",
                  "scriptureReference": "Exodus 31:18"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "Speak to us yourself and we will listen. But do not let God speak to us, lest we die.",
                  "emotion": "fearful",
                  "scriptureReference": "Exodus 20:19"
                },
                {
                  "character": "Miriam",
                  "text": "We have seen the glory of the LORD descend on the mountain. We are a people set apart for Him!",
                  "emotion": "worshipful"
                }
              ]
            },
          
            /* EXODUS EPOCH - LEVEL 10: "THE GOLDEN CALF" */
            {
              "id": "exodus-10-intro",
              "level": 10,
              "epoch": "exodus",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "IsraeliteElder",
                  "text": "Moses has been on the mountain for forty days and forty nights. We do not know what has become of him!",
                  "emotion": "anxious",
                  "scriptureReference": "Exodus 32:1"
                },
                {
                  "character": "IsraeliteYouth",
                  "text": "Come, make us gods who will go before us! As for this Moses, we don't know what has happened to him.",
                  "emotion": "demanding",
                  "scriptureReference": "Exodus 32:1"
                },
                {
                  "character": "Aaron",
                  "text": "Take off the gold earrings that your wives, your sons and your daughters are wearing, and bring them to me.",
                  "emotion": "conflicted",
                  "scriptureReference": "Exodus 32:2"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "These are your gods, O Israel, who brought you up out of Egypt!",
                  "emotion": "celebrating",
                  "scriptureReference": "Exodus 32:4"
                }
              ]
            },
            {
              "id": "exodus-10-calf-piece",
              "level": 10,
              "epoch": "exodus",
              "triggerType": "specialMechanic",
              "mechanicId": "calfPiece",
              "priority": 7,
              "lines": [
                {
                  "character": "Aaron",
                  "text": "I threw the gold into the fire, and this calf came out!",
                  "emotion": "defensive",
                  "scriptureReference": "Exodus 32:24"
                },
                {
                  "character": "IsraeliteFather",
                  "text": "Tomorrow is a feast to the LORD! We will offer sacrifices and celebrate before this golden image!",
                  "emotion": "misguided",
                  "scriptureReference": "Exodus 32:5-6"
                }
              ]
            },
            {
              "id": "exodus-10-calf-removal",
              "level": 10,
              "epoch": "exodus",
              "triggerType": "calfPieceRemoved",
              "count": 5,
              "priority": 6,
              "lines": [
                {
                  "character": "Moses",
                  "text": "What did this people do to you that you have brought so great a sin upon them, Aaron?",
                  "emotion": "angry",
                  "scriptureReference": "Exodus 32:21"
                },
                {
                  "character": "Aaron",
                  "text": "Do not be angry, my lord. You know how prone these people are to evil. They said to me, 'Make us gods who will go before us.'",
                  "emotion": "defensive",
                  "scriptureReference": "Exodus 32:22-23"
                },
                {
                  "character": "Moses",
                  "text": "I threw the gold into the fire, and out came this calf? Aaron, you have let the people run wild!",
                  "emotion": "incredulous",
                  "scriptureReference": "Exodus 32:24,25"
                }
              ]
            },
            {
              "id": "exodus-10-complete",
              "level": 10,
              "epoch": "exodus",
              "triggerType": "levelComplete",
              "priority": 10,
              "lines": [
                {
                  "character": "Moses",
                  "text": "You have committed a great sin. But now I will go up to the LORD; perhaps I can make atonement for your sin.",
                  "emotion": "grieved",
                  "scriptureReference": "Exodus 32:30"
                },
                {
                  "character": "God",
                  "text": "Whoever has sinned against Me, I will blot him out of My book. Nevertheless, I will lead My people to the land I promised.",
                  "emotion": "just",
                  "scriptureReference": "Exodus 32:33-34"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "We have sinned a great sin by making gods of gold. Intercede for us, Moses!",
                  "emotion": "repentant"
                },
                {
                  "character": "Moses",
                  "text": "The Lord has disciplined His people, yet He remains faithful to His covenant. Let us renew our commitment to Him alone.",
                  "emotion": "resolute",
                  "scriptureReference": "Exodus 34:10"
                }
              ]
            },
          
            /* WILDERNESS EPOCH - LEVEL 11: "THE TABERNACLE" */
            {
              "id": "wilderness-11-intro",
              "level": 11,
              "epoch": "wilderness",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "Moses",
                  "text": "Take from among you an offering to the LORD. Whoever is of a willing heart, let him bring it as an offering to the LORD: gold, silver, and bronze.",
                  "emotion": "inviting",
                  "scriptureReference": "Exodus 35:5"
                },
                {
                  "character": "Bezalel",
                  "text": "The LORD has filled me with the Spirit of God, in wisdom, in understanding, in knowledge, and in all manner of workmanship.",
                  "emotion": "humble",
                  "scriptureReference": "Exodus 35:31"
                },
                {
                  "character": "Miriam",
                  "text": "The women who were gifted artisans are spinning yarn for the tabernacle curtains and garments.",
                  "emotion": "diligent",
                  "scriptureReference": "Exodus 35:25"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "We bring our offerings willingly! Gold rings, earrings, necklaces—all for the sanctuary of our God!",
                  "emotion": "generous",
                  "scriptureReference": "Exodus 35:22"
                }
              ]
            },
            {
              "id": "wilderness-11-material-collection",
              "level": 11,
              "epoch": "wilderness",
              "triggerType": "matchTiles",
              "tileType": "gold",
              "count": 4,
              "priority": 5,
              "lines": [
                {
                  "character": "Bezalel",
                  "text": "We need gold for the ark of the covenant and the mercy seat. The purest gold for the place where God will dwell among us.",
                  "emotion": "focused",
                  "scriptureReference": "Exodus 37:1-9"
                },
                {
                  "character": "Aholiab",
                  "text": "The gold must be hammered into thin sheets and cut into threads to be woven into the ephod and breastplate.",
                  "emotion": "creative",
                  "scriptureReference": "Exodus 39:2-3"
                }
              ]
            },
            {
              "id": "wilderness-11-silver-collection",
              "level": 11,
              "epoch": "wilderness",
              "triggerType": "matchTiles",
              "tileType": "silver",
              "count": 4,
              "priority": 5,
              "lines": [
                {
                  "character": "IsraeliteElder",
                  "text": "The silver from the census tax will be used for the foundation sockets of the sanctuary and the hooks for the pillars.",
                  "emotion": "instructing",
                  "scriptureReference": "Exodus 38:25-28"
                },
                {
                  "character": "Bezalel",
                  "text": "Each socket requires a talent of silver. The framework must be solid to support the tabernacle structure.",
                  "emotion": "meticulous"
                }
              ]
            },
            {
              "id": "wilderness-11-blueprint",
              "level": 11,
              "epoch": "wilderness",
              "triggerType": "specialMechanic",
              "mechanicId": "tabernacleBlueprint",
              "priority": 7,
              "lines": [
                {
                  "character": "Moses",
                  "text": "See that you make all things according to the pattern shown to you on the mountain.",
                  "emotion": "commanding",
                  "scriptureReference": "Exodus 25:40"
                },
                {
                  "character": "Bezalel",
                  "text": "The inner sanctuary must be exactly ten cubits in height, width, and length. Every detail matters in God's dwelling place.",
                  "emotion": "precise",
                  "scriptureReference": "Exodus 26:15-30"
                }
              ]
            },
            {
              "id": "wilderness-11-complete",
              "level": 11,
              "epoch": "wilderness",
              "triggerType": "levelComplete",
              "priority": 10,
              "lines": [
                {
                  "character": "Moses",
                  "text": "The people bring much more than enough for the service of the work which the LORD commanded us to do!",
                  "emotion": "amazed",
                  "scriptureReference": "Exodus 36:5"
                },
                {
                  "character": "Bezalel",
                  "text": "The tabernacle is complete, with all its furnishings, according to all that the LORD has commanded.",
                  "emotion": "satisfied",
                  "scriptureReference": "Exodus 39:32"
                },
                {
                  "character": "Aaron",
                  "text": "Now I will be consecrated to minister as priest before the LORD, wearing these holy garments made with gold, blue, purple, and scarlet thread.",
                  "emotion": "honored",
                  "scriptureReference": "Exodus 39:1-2"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "The glory of the LORD fills the tabernacle! The cloud covers the tent of meeting, and we cannot enter!",
                  "emotion": "awestruck",
                  "scriptureReference": "Exodus 40:34-35"
                }
              ]
            },
          
            /* WILDERNESS EPOCH - LEVEL 12: "THE TWELVE SPIES" */
            {
              "id": "wilderness-12-intro",
              "level": 12,
              "epoch": "wilderness",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "God",
                  "text": "Send men to spy out the land of Canaan, which I am giving to the children of Israel; from each tribe of their fathers you shall send a man, every one a leader among them.",
                  "emotion": "commanding",
                  "scriptureReference": "Numbers 13:1-2"
                },
                {
                  "character": "Moses",
                  "text": "Go up into the mountains, and see what the land is like: whether the people who dwell in it are strong or weak, few or many.",
                  "emotion": "instructing",
                  "scriptureReference": "Numbers 13:17-18"
                },
                {
                  "character": "Joshua",
                  "text": "We will observe the cities, whether they are like camps or strongholds, and whether the land is good or bad, rich or poor.",
                  "emotion": "attentive",
                  "scriptureReference": "Numbers 13:19-20"
                },
                {
                  "character": "Caleb",
                  "text": "We must also bring back some of the fruit of the land. It is the season for the first ripe grapes.",
                  "emotion": "practical",
                  "scriptureReference": "Numbers 13:20"
                }
              ]
            },
            {
              "id": "wilderness-12-spy-mechanic",
              "level": 12,
              "epoch": "wilderness",
              "triggerType": "specialMechanic",
              "mechanicId": "spyMovement",
              "priority": 7,
              "lines": [
                {
                  "character": "IsraeliteElder",
                  "text": "The spies must move carefully through the land. If they are discovered, all may be lost.",
                  "emotion": "cautious"
                },
                {
                  "character": "Moses",
                  "text": "Be of good courage. Bring back word of what you find, that we may know how to enter the land.",
                  "emotion": "encouraging",
                  "scriptureReference": "Numbers 13:20"
                }
              ]
            },
            {
              "id": "wilderness-12-spy-progress",
              "level": 12,
              "epoch": "wilderness",
              "triggerType": "specialMechanic",
              "mechanicId": "spyProgress",
              "progress": 0.5,
              "priority": 6,
              "lines": [
                {
                  "character": "Joshua",
                  "text": "We have passed through the Negev and are entering the hill country. The journey is long but fruitful.",
                  "emotion": "determined",
                  "scriptureReference": "Numbers 13:22"
                },
                {
                  "character": "Caleb",
                  "text": "We must go up to Hebron, where the descendants of Anak dwell. We will see the strength of the people firsthand.",
                  "emotion": "brave",
                  "scriptureReference": "Numbers 13:22"
                }
              ]
            },
            {
              "id": "wilderness-12-complete",
              "level": 12,
              "epoch": "wilderness",
              "triggerType": "levelComplete",
              "priority": 10,
              "lines": [
                {
                  "character": "SpyLeader",
                  "text": "We went to the land where you sent us. It truly flows with milk and honey, and this is its fruit!",
                  "emotion": "reporting",
                  "scriptureReference": "Numbers 13:27"
                },
                {
                  "character": "TenSpies",
                  "text": "Nevertheless, the people who dwell in the land are strong; the cities are fortified and very large; moreover we saw the descendants of Anak there.",
                  "emotion": "fearful",
                  "scriptureReference": "Numbers 13:28"
                },
                {
                  "character": "Caleb",
                  "text": "Let us go up at once and take possession, for we are well able to overcome it!",
                  "emotion": "confident",
                  "scriptureReference": "Numbers 13:30"
                },
                {
                  "character": "TenSpies",
                  "text": "We are not able to go up against the people, for they are stronger than we. The land devours its inhabitants, and all the people we saw are men of great stature!",
                  "emotion": "terrified",
                  "scriptureReference": "Numbers 13:31-32"
                }
              ]
            },
          
            /* WILDERNESS EPOCH - LEVEL 13: "GRAPES OF CANAAN" */
            {
              "id": "wilderness-13-intro",
              "level": 13,
              "epoch": "wilderness",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "Moses",
                  "text": "See whether the land is good or bad, and whether there is wood in it or not. Be of good courage, and bring some of the fruit of the land.",
                  "emotion": "encouraging",
                  "scriptureReference": "Numbers 13:20"
                },
                {
                  "character": "Joshua",
                  "text": "We have reached the Valley of Eshcol. Look at these abundant vineyards!",
                  "emotion": "amazed",
                  "scriptureReference": "Numbers 13:23"
                },
                {
                  "character": "Caleb",
                  "text": "The clusters of grapes are enormous! It will take two men to carry just one cluster on a pole!",
                  "emotion": "excited",
                  "scriptureReference": "Numbers 13:23"
                },
                {
                  "character": "FearfulSpy",
                  "text": "Be careful! There are scorpions and other dangers here. The inhabitants may discover us!",
                  "emotion": "nervous"
                }
              ]
            },
            {
              "id": "wilderness-13-grape-cluster",
              "level": 13,
              "epoch": "wilderness",
              "triggerType": "specialMechanic",
              "mechanicId": "grapeCluster",
              "priority": 7,
              "lines": [
                {
                  "character": "Joshua",
                  "text": "This single cluster of grapes is evidence of the land's fertility. Truly it flows with milk and honey!",
                  "emotion": "impressed",
                  "scriptureReference": "Numbers 13:27"
                },
                {
                  "character": "Spy",
                  "text": "We must cut it down carefully and carry it between two of us on a pole. We will also take some pomegranates and figs.",
                  "emotion": "determined",
                  "scriptureReference": "Numbers 13:23"
                }
              ]
            },
            {
              "id": "wilderness-13-scorpion-obstacle",
              "level": 13,
              "epoch": "wilderness",
              "triggerType": "obstacleEncountered",
              "obstacleType": "scorpion",
              "priority": 6,
              "lines": [
                {
                  "character": "FearfulSpy",
                  "text": "Watch out for the scorpions! This land may be fruitful, but it also has many dangers!",
                  "emotion": "alarmed"
                },
                {
                  "character": "Caleb",
                  "text": "Do not be distracted by small threats. Keep your eyes on the great prize that God has promised us.",
                  "emotion": "focused"
                }
              ]
            },
            {
              "id": "wilderness-13-complete",
              "level": 13,
              "epoch": "wilderness",
              "triggerType": "levelComplete",
              "priority": 10,
              "lines": [
                {
                  "character": "Joshua",
                  "text": "We have gathered the fruit as commanded. This place shall be called the Valley of Eshcol, because of the cluster of grapes we cut down from there.",
                  "emotion": "accomplished",
                  "scriptureReference": "Numbers 13:24"
                },
                {
                  "character": "Caleb",
                  "text": "These fruits are proof of God's promise. The land truly flows with milk and honey!",
                  "emotion": "confident",
                  "scriptureReference": "Numbers 13:27"
                },
                {
                  "character": "FearfulSpy",
                  "text": "Yes, the fruit is good, but do not forget the fortified cities and the giants we saw. We were like grasshoppers in our own sight!",
                  "emotion": "intimidated",
                  "scriptureReference": "Numbers 13:28,33"
                },
                {
                  "character": "Moses",
                  "text": "Let me see what you have brought back after these forty days. Show me the fruit of the land that God has promised us.",
                  "emotion": "expectant",
                  "scriptureReference": "Numbers 13:25"
                }
              ]
            },
          
            /* WILDERNESS EPOCH - LEVEL 14: "GIANTS IN THE LAND" */
            {
              "id": "wilderness-14-intro",
              "level": 14,
              "epoch": "wilderness",
              "triggerType": "levelStart",
              "priority": 10,
              "lines": [
                {
                  "character": "TenSpies",
                  "text": "We went to the land where you sent us. It flows with milk and honey. But the people who dwell in the land are strong! The cities are fortified and very large!",
                  "emotion": "intimidated",
                  "scriptureReference": "Numbers 13:27-28"
                },
                {
                  "character": "FearfulSpy",
                  "text": "We saw the descendants of Anak there—the Nephilim! We were like grasshoppers in our own sight, and so we were in their sight!",
                  "emotion": "terrified",
                  "scriptureReference": "Numbers 13:33"
                },
                {
                  "character": "IsraelitePeople",
                  "text": "If only we had died in the land of Egypt! Or if only we had died in this wilderness! Why has the LORD brought us to this land to fall by the sword?",
                  "emotion": "wailing",
                  "scriptureReference": "Numbers 14:2-3"
                },
                {
                  "character": "Caleb",
                  "text": "The land we passed through is an exceedingly good land. If the LORD delights in us, then He will bring us into this land and give it to us!",
                  "emotion": "encouraging",
                  "scriptureReference": "Numbers 14:7-8"
                }
              ]
            },
            [
                {
                  "id": "wilderness-14-giant-obstacle-continued",
                  "level": 14,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "giantObstacle",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "Joshua",
                      "text": "Only do not rebel against the LORD, nor fear the people of the land, for they are our bread; their protection has departed from them, and the LORD is with us!",
                      "emotion": "courageous",
                      "scriptureReference": "Numbers 14:9"
                    }
                  ]
                },
                {
                  "id": "wilderness-14-courage-meter",
                  "level": 14,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "courageMeter",
                  "threshold": 0.3,
                  "priority": 6,
                  "lines": [
                    {
                      "character": "IsraelitePeople",
                      "text": "Our courage fails! Let us select a leader and return to Egypt!",
                      "emotion": "mutinous",
                      "scriptureReference": "Numbers 14:4"
                    },
                    {
                      "character": "Moses",
                      "text": "Do not be afraid! Remember how the LORD your God carried you, as a father carries his son, all the way you have come until you reached this place.",
                      "emotion": "pleading",
                      "scriptureReference": "Deuteronomy 1:29-31"
                    }
                  ]
                },
                {
                  "id": "wilderness-14-complete",
                  "level": 14,
                  "epoch": "wilderness",
                  "triggerType": "levelComplete",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "God",
                      "text": "How long will these people reject Me? And how long will they not believe Me, with all the signs which I have performed among them?",
                      "emotion": "grieved",
                      "scriptureReference": "Numbers 14:11"
                    },
                    {
                      "character": "Moses",
                      "text": "LORD, please pardon the iniquity of this people, according to the greatness of Your mercy, just as You have forgiven this people from Egypt until now.",
                      "emotion": "interceding",
                      "scriptureReference": "Numbers 14:19"
                    },
                    {
                      "character": "God",
                      "text": "I have pardoned, according to your word; but none of the men who have seen My glory and signs in Egypt and in the wilderness shall see the land which I swore to their fathers.",
                      "emotion": "just",
                      "scriptureReference": "Numbers 14:20-23"
                    },
                    {
                      "character": "Moses",
                      "text": "Because of your unbelief, you shall wander in the wilderness forty years – one year for each of the forty days you spied out the land.",
                      "emotion": "solemn",
                      "scriptureReference": "Numbers 14:34"
                    }
                  ]
                },
              
                /* WILDERNESS EPOCH - LEVEL 15: "FAITH OF JOSHUA AND CALEB" */
                {
                  "id": "wilderness-15-intro",
                  "level": 15,
                  "epoch": "wilderness",
                  "triggerType": "levelStart",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "God",
                      "text": "But My servant Caleb, because he has a different spirit and has followed Me fully, I will bring into the land where he went, and his descendants shall inherit it.",
                      "emotion": "approving",
                      "scriptureReference": "Numbers 14:24"
                    },
                    {
                      "character": "Moses",
                      "text": "Only Joshua son of Nun and Caleb son of Jephunneh shall see the Promised Land. They alone had faith when others doubted.",
                      "emotion": "affirming",
                      "scriptureReference": "Numbers 14:30"
                    },
                    {
                      "character": "Joshua",
                      "text": "The land we passed through to spy out is an exceedingly good land. If the LORD delights in us, He will bring us into this land and give it to us.",
                      "emotion": "faithful",
                      "scriptureReference": "Numbers 14:7-8"
                    },
                    {
                      "character": "Caleb",
                      "text": "Only do not rebel against the LORD, nor fear the people of the land, for they are our bread; their protection has departed from them, and the LORD is with us. Do not fear them!",
                      "emotion": "bold",
                      "scriptureReference": "Numbers 14:9"
                    }
                  ]
                },
                {
                  "id": "wilderness-15-dual-character",
                  "level": 15,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "dualCharacter",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "Joshua",
                      "text": "We must work together, Caleb. Where you go, I will go. Our faith must remain strong when others falter.",
                      "emotion": "determined"
                    },
                    {
                      "character": "Caleb",
                      "text": "Together we stand against the fear that has gripped our people. The LORD is with us, Joshua!",
                      "emotion": "resolute"
                    }
                  ]
                },
                {
                  "id": "wilderness-15-promised-land",
                  "level": 15,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "promisedLandArea",
                  "progress": 0.5,
                  "priority": 6,
                  "lines": [
                    {
                      "character": "Joshua",
                      "text": "Look ahead, Caleb! We are getting closer to the Promised Land section. We must hold to our faith!",
                      "emotion": "encouraging"
                    },
                    {
                      "character": "Caleb",
                      "text": "The others wanted to stone us for our report, but the glory of the LORD appeared at the tabernacle before all the people. God is with us!",
                      "emotion": "grateful",
                      "scriptureReference": "Numbers 14:10"
                    }
                  ]
                },
                {
                  "id": "wilderness-15-complete",
                  "level": 15,
                  "epoch": "wilderness",
                  "triggerType": "levelComplete",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "God",
                      "text": "Because all these men who have seen My glory and signs in Egypt and in the wilderness have put Me to the test these ten times, they shall not see the land I swore to their fathers.",
                      "emotion": "decree",
                      "scriptureReference": "Numbers 14:22-23"
                    },
                    {
                      "character": "Joshua",
                      "text": "Forty years we will wander, but the LORD has promised that you and I, Caleb, will live to enter the land.",
                      "emotion": "hopeful",
                      "scriptureReference": "Numbers 14:30"
                    },
                    {
                      "character": "Caleb",
                      "text": "I am now eighty-five years old, yet I am as strong today as I was the day Moses sent me. For war or for daily tasks, my strength is the same.",
                      "emotion": "vigorous",
                      "scriptureReference": "Joshua 14:10-11"
                    },
                    {
                      "character": "Moses",
                      "text": "These two faithful men will receive their inheritance. Their children will enter the land, while the children of those who rejected the LORD's promise will wander in the wilderness.",
                      "emotion": "prophetic",
                      "scriptureReference": "Numbers 14:31"
                    }
                  ]
                },
              
                /* WILDERNESS EPOCH - LEVEL 16: "THE BRONZE SERPENT" */
                {
                  "id": "wilderness-16-intro",
                  "level": 16,
                  "epoch": "wilderness",
                  "triggerType": "levelStart",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "IsraeliteElder",
                      "text": "The people have spoken against God and against you, Moses. We are tired of this miserable food and lack of water!",
                      "emotion": "complaining",
                      "scriptureReference": "Numbers 21:5"
                    },
                    {
                      "character": "IsraeliteMother",
                      "text": "Look! Fiery serpents are in the camp! Many have been bitten and are dying!",
                      "emotion": "terrified",
                      "scriptureReference": "Numbers 21:6"
                    },
                    {
                      "character": "IsraelitePeople",
                      "text": "We have sinned, for we have spoken against the LORD and against you. Pray that the LORD takes away the serpents!",
                      "emotion": "repentant",
                      "scriptureReference": "Numbers 21:7"
                    },
                    {
                      "character": "Moses",
                      "text": "I will pray for the people. The Lord will provide a way of healing.",
                      "emotion": "merciful"
                    }
                  ]
                },
                {
                  "id": "wilderness-16-serpent-mechanic",
                  "level": 16,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "serpentBite",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "IsraeliteFather",
                      "text": "My child has been bitten! The venom spreads quickly! Is there no remedy?",
                      "emotion": "desperate"
                    },
                    {
                      "character": "Moses",
                      "text": "I have sought the LORD's guidance. He has shown me what must be done.",
                      "emotion": "resolute",
                      "scriptureReference": "Numbers 21:8"
                    }
                  ]
                },
                {
                  "id": "wilderness-16-healing-activated",
                  "level": 16,
                  "epoch": "wilderness",
                  "triggerType": "healingActivated",
                  "priority": 6,
                  "lines": [
                    {
                      "character": "God",
                      "text": "Make a fiery serpent, and set it on a pole; and it shall be that everyone who is bitten, when he looks at it, shall live.",
                      "emotion": "commanding",
                      "scriptureReference": "Numbers 21:8"
                    },
                    {
                      "character": "Moses",
                      "text": "I have made a bronze serpent and put it on a pole. Everyone who is bitten, look at it and live!",
                      "emotion": "instructing",
                      "scriptureReference": "Numbers 21:9"
                    },
                    {
                      "character": "IsraeliteFather",
                      "text": "My child was bitten and near death. But we looked upon the bronze serpent, and now the healing has begun!",
                      "emotion": "grateful"
                    }
                  ]
                },
                {
                  "id": "wilderness-16-complete",
                  "level": 16,
                  "epoch": "wilderness",
                  "triggerType": "levelComplete",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "IsraeliteElder",
                      "text": "Many who were dying have been healed. The bronze serpent has saved our people.",
                      "emotion": "relieved"
                    },
                    {
                      "character": "Moses",
                      "text": "It is not the bronze serpent that heals, but God who offers mercy when we look to His provision with faith.",
                      "emotion": "teaching"
                    },
                    {
                      "character": "IsraeliteMother",
                      "text": "We have learned a hard lesson. Our complaints brought judgment, but God's mercy provided healing.",
                      "emotion": "reflective"
                    },
                    {
                      "character": "Aaron",
                      "text": "Let us journey onward with thankful hearts, remembering both God's justice and His mercy.",
                      "emotion": "resolved",
                      "scriptureReference": "Numbers 21:10"
                    }
                  ]
                },
              
                /* WILDERNESS EPOCH - LEVEL 17: "WATER FROM THE ROCK AT KADESH" */
                {
                  "id": "wilderness-17-intro",
                  "level": 17,
                  "epoch": "wilderness",
                  "triggerType": "levelStart",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "IsraelitePeople",
                      "text": "There is no water for the congregation! Why have you brought us up out of Egypt, to bring us to this evil place?",
                      "emotion": "angry",
                      "scriptureReference": "Numbers 20:2,5"
                    },
                    {
                      "character": "Moses",
                      "text": "Why have you brought the assembly of the LORD into this wilderness, that we and our animals should die here?",
                      "emotion": "frustrated",
                      "scriptureReference": "Numbers 20:4"
                    },
                    {
                      "character": "God",
                      "text": "Take the rod; you and your brother Aaron gather the assembly together. Speak to the rock before their eyes, and it will yield its water.",
                      "emotion": "instructing",
                      "scriptureReference": "Numbers 20:8"
                    },
                    {
                      "character": "Aaron",
                      "text": "The people have gathered as the LORD commanded. They are waiting for water.",
                      "emotion": "anxious"
                    }
                  ]
                },
                {
                  "id": "wilderness-17-rock-obstacle",
                  "level": 17,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "massiveRock",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "Hear now, you rebels! Must we bring water for you out of this rock?",
                      "emotion": "angry",
                      "scriptureReference": "Numbers 20:10"
                    },
                    {
                      "character": "IsraelitePeople",
                      "text": "We and our livestock will die of thirst! Why did you bring us out of Egypt to this terrible place?",
                      "emotion": "desperate",
                      "scriptureReference": "Numbers 20:4-5"
                    }
                  ]
                },
                {
                  "id": "wilderness-17-staff-pattern",
                  "level": 17,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "staffPattern",
                  "priority": 6,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "The Lord said to speak to the rock, but I am so angry with these people!",
                      "emotion": "conflicted",
                      "scriptureReference": "Numbers 20:8"
                    },
                    {
                      "character": "Aaron",
                      "text": "Brother, remember the LORD's command clearly. We must do exactly as He instructed.",
                      "emotion": "cautioning"
                    }
                  ]
                },
                {
                  "id": "wilderness-17-rock-struck",
                  "level": 17,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "rockStruck",
                  "priority": 8,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "[Strikes the rock twice with his rod]",
                      "emotion": "angry",
                      "scriptureReference": "Numbers 20:11"
                    },
                    {
                      "character": "IsraelitePeople",
                      "text": "Water! The water gushes forth abundantly! Our thirst will be quenched!",
                      "emotion": "rejoicing",
                      "scriptureReference": "Numbers 20:11"
                    }
                  ]
                },
                {
                  "id": "wilderness-17-complete",
                  "level": 17,
                  "epoch": "wilderness",
                  "triggerType": "levelComplete",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "God",
                      "text": "Because you did not believe Me, to hallow Me in the eyes of the children of Israel, therefore you shall not bring this assembly into the land which I have given them.",
                      "emotion": "disappointed",
                      "scriptureReference": "Numbers 20:12"
                    },
                    {
                      "character": "Moses",
                      "text": "I struck the rock in anger when the LORD commanded me to speak to it. Now I will not enter the Promised Land.",
                      "emotion": "regretful"
                    },
                    {
                      "character": "Aaron",
                      "text": "We both bear this judgment. Neither of us will cross into Canaan with the people.",
                      "emotion": "accepting",
                      "scriptureReference": "Numbers 20:24"
                    },
                    {
                      "character": "IsraelitePeople",
                      "text": "This is the water of Meribah, because the children of Israel contended with the LORD, and He showed Himself holy among them.",
                      "emotion": "humbled",
                      "scriptureReference": "Numbers 20:13"
                    }
                  ]
                },
              
                /* WILDERNESS EPOCH - LEVEL 18: "BALAAM'S DONKEY" */
                {
                  "id": "wilderness-18-intro",
                  "level": 18,
                  "epoch": "wilderness",
                  "triggerType": "levelStart",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "Balak",
                      "text": "Behold, a people has come from Egypt. They cover the face of the earth, and are settling next to me! Come at once, curse this people for me, for they are too mighty for me.",
                      "emotion": "fearful",
                      "scriptureReference": "Numbers 22:5-6"
                    },
                    {
                      "character": "Balaam",
                      "text": "Lodge here tonight, and I will bring back word to you, as the LORD speaks to me.",
                      "emotion": "noncommittal",
                      "scriptureReference": "Numbers 22:8"
                    },
                    {
                      "character": "God",
                      "text": "You shall not go with them; you shall not curse the people, for they are blessed.",
                      "emotion": "commanding",
                      "scriptureReference": "Numbers 22:12"
                    },
                    {
                      "character": "Balaam",
                      "text": "The princes of Moab offer honor and riches if I come. I will ask the LORD again if I may go with them.",
                      "emotion": "conflicted",
                      "scriptureReference": "Numbers 22:15-19"
                    }
                  ]
                },
                {
                  "id": "wilderness-18-donkey-path",
                  "level": 18,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "donkeyMovement",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "Balaam",
                      "text": "God has said I may go with the men, but I must speak only what He tells me.",
                      "emotion": "resolute",
                      "scriptureReference": "Numbers 22:20-21"
                    },
                    {
                      "character": "Narrator",
                      "text": "But God was angry because Balaam went, and the Angel of the LORD took His stand in the way as an adversary against him.",
                      "emotion": "ominous",
                      "scriptureReference": "Numbers 22:22"
                    }
                  ]
                },
                {
                  "id": "wilderness-18-angel-obstacle",
                  "level": 18,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "angelObstacle",
                  "priority": 6,
                  "lines": [
                    {
                      "character": "Balaam",
                      "text": "Why have you turned aside these three times? Come, you stubborn donkey!",
                      "emotion": "angry",
                      "scriptureReference": "Numbers 22:23-27"
                    },
                    {
                      "character": "BalaamsДonkey",
                      "text": "The donkey sees the Angel of the LORD standing in the way with His drawn sword and turns aside to avoid Him.",
                      "emotion": "frightened",
                      "scriptureReference": "Numbers 22:23"
                    }
                  ]
                },
                {
                  "id": "wilderness-18-donkey-speaks",
                  "level": 18,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "donkeySpeaks",
                  "priority": 8,
                  "lines": [
                    {
                      "character": "BalaamsДonkey",
                      "text": "What have I done to you, that you have struck me these three times?",
                      "emotion": "questioning",
                      "scriptureReference": "Numbers 22:28"
                    },
                    {
                      "character": "Balaam",
                      "text": "Because you have made a fool of me! I wish there were a sword in my hand, for now I would kill you!",
                      "emotion": "furious",
                      "scriptureReference": "Numbers 22:29"
                    },
                    {
                      "character": "BalaamsДonkey",
                      "text": "Am I not your donkey on which you have ridden all your life until this day? Was I ever in the habit of doing this to you?",
                      "emotion": "reasoned",
                      "scriptureReference": "Numbers 22:30"
                    }
                  ]
                },
                {
                  "id": "wilderness-18-complete",
                  "level": 18,
                  "epoch": "wilderness",
                  "triggerType": "levelComplete",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "Angel",
                      "text": "Why have you struck your donkey these three times? Behold, I have come out to stand against you, because your way is perverse before Me.",
                      "emotion": "rebuking",
                      "scriptureReference": "Numbers 22:32"
                    },
                    {
                      "character": "Balaam",
                      "text": "I have sinned, for I did not know You stood in the way against me. Now therefore, if it displeases You, I will turn back.",
                      "emotion": "humbled",
                      "scriptureReference": "Numbers 22:34"
                    },
                    {
                      "character": "Angel",
                      "text": "Go with the men, but only the word that I speak to you, that you shall speak.",
                      "emotion": "commanding",
                      "scriptureReference": "Numbers 22:35"
                    },
                    {
                      "character": "Balaam",
                      "text": "How shall I curse whom God has not cursed? How shall I denounce whom the LORD has not denounced? Who can count the dust of Jacob, or number one-fourth of Israel?",
                      "emotion": "prophetic",
                      "scriptureReference": "Numbers 23:8,10"
                    }
                  ]
                },
              
                /* WILDERNESS EPOCH - LEVEL 19: "THE PLAINS OF MOAB" */
                {
                  "id": "wilderness-19-intro",
                  "level": 19,
                  "epoch": "wilderness",
                  "triggerType": "levelStart",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "The children of Israel have moved, and camped in the plains of Moab on the side of the Jordan across from Jericho.",
                      "emotion": "informative",
                      "scriptureReference": "Numbers 22:1"
                    },
                    {
                      "character": "IsraeliteElder",
                      "text": "We have completed our forty years of wandering! The Promised Land lies just across the Jordan River.",
                      "emotion": "anticipating"
                    },
                    {
                      "character": "God",
                      "text": "Take a census of all the congregation of the children of Israel, by their families, all who are able to go to war in Israel.",
                      "emotion": "commanding",
                      "scriptureReference": "Numbers 26:2"
                    },
                    {
                      "character": "Joshua",
                      "text": "The new generation must be counted and organized by their tribes, in preparation for entering Canaan.",
                      "emotion": "organized",
                      "scriptureReference": "Numbers 26:4"
                    }
                  ]
                },
                {
                  "id": "wilderness-19-tribal-arrangement",
                  "level": 19,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "tribalArrangement",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "Each tribe must camp in its designated area, with the tabernacle at the center.",
                      "emotion": "instructing",
                      "scriptureReference": "Numbers 2:1-2"
                    },
                    {
                      "character": "TribalLeader",
                      "text": "We must arrange our camp according to the pattern God showed Moses. Order is essential as we prepare to enter the land.",
                      "emotion": "focused"
                    }
                  ]
                },
                {
                  "id": "wilderness-19-formation-progress",
                  "level": 19,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "formationProgress",
                  "progress": 0.5,
                  "priority": 6,
                  "lines": [
                    {
                      "character": "Joshua",
                      "text": "The tribes of Judah, Issachar, and Zebulun are positioned. Now we must arrange Reuben, Simeon, and Gad.",
                      "emotion": "organizing",
                      "scriptureReference": "Numbers 2:3-14"
                    },
                    {
                      "character": "IsraeliteElder",
                      "text": "Never has Israel been so well organized! Over 600,000 men of fighting age, arranged by tribe and family.",
                      "emotion": "impressed",
                      "scriptureReference": "Numbers 26:51"
                    }
                  ]
                },
                {
                  "id": "wilderness-19-complete",
                  "level": 19,
                  "epoch": "wilderness",
                  "triggerType": "levelComplete",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "To these the land shall be divided as an inheritance, according to the number of names. To a large tribe you shall give a larger inheritance, and to a small tribe you shall give a smaller inheritance.",
                      "emotion": "judicious",
                      "scriptureReference": "Numbers 26:53-54"
                    },
                    {
                      "character": "Joshua",
                      "text": "The people are organized and ready. The Jordan River is all that stands between us and the land promised to our fathers.",
                      "emotion": "prepared"
                    },
                    {
                      "character": "IsraeliteElder",
                      "text": "Of all the men who left Egypt forty years ago, only Caleb son of Jephunneh and Joshua son of Nun remain, as the LORD said.",
                      "emotion": "reflective",
                      "scriptureReference": "Numbers 26:65"
                    },
                    {
                      "character": "Moses",
                      "text": "My time to lead you is drawing to a close. Soon Joshua will take you across the Jordan into the land flowing with milk and honey.",
                      "emotion": "farewell",
                      "scriptureReference": "Deuteronomy 31:7-8"
                    }
                  ]
                },
              
                /* WILDERNESS EPOCH - LEVEL 20: "MOSES VIEWS THE PROMISED LAND" */
                {
                  "id": "wilderness-20-intro",
                  "level": 20,
                  "epoch": "wilderness",
                  "triggerType": "levelStart",
                  "priority": 10,
                  "lines": [
                    {
                      "character": "God",
                      "text": "Moses, go up Mount Nebo to the top of Pisgah, and view the land of Canaan, which I am giving to the children of Israel as a possession.",
                      "emotion": "commanding",
                      "scriptureReference": "Deuteronomy 34:1"
                    },
                    {
                      "character": "Moses",
                      "text": "After forty years in the wilderness, I will finally see the Promised Land, though I cannot enter it.",
                      "emotion": "solemn",
                      "scriptureReference": "Deuteronomy 34:4"
                    },
                    {
                      "character": "Joshua",
                      "text": "The people await your final words, Moses. You have led us faithfully all these years.",
                      "emotion": "respectful"
                    },
                    {
                      "character": "Moses",
                      "text": "The Lord told me: 'This is the land of which I swore to give Abraham, Isaac, and Jacob.' Now I must climb and see it with my own eyes.",
                      "emotion": "reflective",
                      "scriptureReference": "Deuteronomy 34:4"
                    }
                  ]
                },
                {
                  "id": "wilderness-20-mountain-climb",
                  "level": 20,
                  "epoch": "wilderness",
                  "triggerType": "specialMechanic",
                  "mechanicId": "summitClimb",
                  "priority": 7,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "Though I am one hundred and twenty years old, my eyes are not dim nor my natural vigor diminished. I will climb this mountain to see what our people have journeyed so long to reach.",
                      "emotion": "determined",
                      "scriptureReference": "Deuteronomy 34:7"
                    },
                    {
                      "character": "IsraeliteElder",
                      "text": "Moses goes up alone, to meet with God one final time and to glimpse the Promised Land.",
                      "emotion": "solemn"
                    }
                  ]
                },
                {
                  "id": "wilderness-20-fog",
                  "level": 20,
                  "epoch": "wilderness",
                  "triggerType": "fogCleared",
                  "count": 5,
                  "priority": 6,
                  "lines": [
                    {
                      "character": "Moses",
                      "text": "As the mist clears, I can see more of the land promised to our fathers. What a beautiful sight!",
                      "emotion": "awestruck"
                    },
                    {
                      "character": "God",
                      "text": "Look northward, westward, southward, and eastward; behold it with your eyes, for you shall not cross over this Jordan.",
                      "emotion": "instructing",
                      "scriptureReference": "Deuteronomy 3:27"
                    },
                    {
                      "character": "Moses",
                      "text": "I see the land of Gilead as far as Dan, all Naphtali and the land of Ephraim and Manasseh.",
                      "emotion": "observing",
                      "scriptureReference": "Deuteronomy 34:2"
                    }
                  ]
                },
                [
                    {
                      "id": "wilderness-20-complete-continued",
                      "level": 20,
                      "epoch": "wilderness",
                      "triggerType": "levelComplete",
                      "priority": 10,
                      "lines": [
                        {
                          "character": "IsraelitePeople",
                          "text": "The children of Israel weep for Moses in the plains of Moab for thirty days.",
                          "emotion": "mourning",
                          "scriptureReference": "Deuteronomy 34:8"
                        },
                        {
                          "character": "Narrator",
                          "text": "Joshua son of Nun was filled with the spirit of wisdom because Moses had laid his hands on him. The Israelites listened to him and did what the LORD had commanded Moses.",
                          "emotion": "transitional",
                          "scriptureReference": "Deuteronomy 34:9"
                        },
                        {
                          "character": "Narrator",
                          "text": "Since then, no prophet has risen in Israel like Moses, whom the LORD knew face to face.",
                          "emotion": "concluding",
                          "scriptureReference": "Deuteronomy 34:10"
                        }
                      ]
                    },
                  
                    /* ADDITIONAL DIALOGUE EXAMPLES FOR FAITH METER */
                    {
                      "id": "faith-meter-25",
                      "epoch": "any",
                      "triggerType": "faithMeterProgress",
                      "progress": 0.25,
                      "priority": 4,
                      "lines": [
                        {
                          "character": "IsraeliteFather",
                          "text": "Perhaps the Lord will remember His covenant with Abraham, Isaac, and Jacob.",
                          "emotion": "hopeful"
                        },
                        {
                          "character": "IsraeliteChild",
                          "text": "Father, will God help us as He helped our ancestors?",
                          "emotion": "curious"
                        }
                      ]
                    },
                    {
                      "id": "faith-meter-50",
                      "epoch": "any",
                      "triggerType": "faithMeterProgress",
                      "progress": 0.5,
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Miriam",
                          "text": "I can feel the Lord's presence growing stronger among us!",
                          "emotion": "faithful"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "When we trust in the Lord, He shows His mighty hand. Remember all He has done for us!",
                          "emotion": "encouraging"
                        }
                      ]
                    },
                    {
                      "id": "faith-meter-75",
                      "epoch": "any",
                      "triggerType": "faithMeterProgress",
                      "progress": 0.75,
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Aaron",
                          "text": "The glory of the Lord shines upon His people when they trust in Him.",
                          "emotion": "reverent"
                        },
                        {
                          "character": "IsraeliteMother",
                          "text": "We have seen the Lord's deliverance before, and we will see it again!",
                          "emotion": "confident"
                        }
                      ]
                    },
                    {
                      "id": "faith-meter-full",
                      "epoch": "any",
                      "triggerType": "faithMeterProgress",
                      "progress": 1.0,
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "The Lord's power is with us now! He will act on our behalf!",
                          "emotion": "expectant"
                        },
                        {
                          "character": "IsraelitePeople",
                          "text": "Our God is mighty to save! His strong arm is lifted up for His people!",
                          "emotion": "worshipful"
                        }
                      ]
                    },
                  
                    /* DIVINE INTERVENTION DIALOGUES */
                    {
                      "id": "divine-red-sea",
                      "epoch": "exodus",
                      "triggerType": "divinePowerActivated",
                      "powerType": "redSeaParting",
                      "priority": 9,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "See the salvation of the LORD! His mighty hand parts the waters before us!",
                          "emotion": "triumphant",
                          "scriptureReference": "Exodus 14:13"
                        },
                        {
                          "character": "IsraelitePeople",
                          "text": "A path through the sea! Truly the LORD fights for Israel!",
                          "emotion": "amazed",
                          "scriptureReference": "Exodus 14:14"
                        }
                      ]
                    },
                    {
                      "id": "divine-manna",
                      "epoch": "wilderness",
                      "triggerType": "divinePowerActivated",
                      "powerType": "mannaShower",
                      "priority": 9,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Behold! The bread from heaven which the LORD has given you to eat!",
                          "emotion": "proclaiming",
                          "scriptureReference": "Exodus 16:15"
                        },
                        {
                          "character": "IsraeliteChild",
                          "text": "It falls like dew all around the camp! Sweet like honey and coriander seed!",
                          "emotion": "delighted",
                          "scriptureReference": "Exodus 16:31"
                        }
                      ]
                    },
                    {
                      "id": "divine-tablets",
                      "epoch": "any",
                      "triggerType": "divinePowerActivated",
                      "powerType": "tabletsOfStone",
                      "priority": 9,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "The word of the LORD is established forever! His commandments are truth!",
                          "emotion": "reverent"
                        },
                        {
                          "character": "Aaron",
                          "text": "The LORD has engraved His will in stone. Let us engrave it also on our hearts.",
                          "emotion": "solemn",
                          "scriptureReference": "Exodus 31:18"
                        }
                      ]
                    },
                  
                    /* SPECIAL MATCH DIALOGUES */
                    {
                      "id": "special-match-l-shape",
                      "epoch": "any",
                      "triggerType": "specialMatch",
                      "matchType": "L-shape",
                      "priority": 3,
                      "lines": [
                        {
                          "character": "IsraeliteYouth",
                          "text": "The Lord guides our path, even when it turns in unexpected ways!",
                          "emotion": "insightful"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "Just as our journey has taken many turns, the Lord has been with us at every corner.",
                          "emotion": "wise"
                        }
                      ]
                    },
                    {
                      "id": "special-match-t-shape",
                      "epoch": "any",
                      "triggerType": "specialMatch",
                      "matchType": "T-shape",
                      "priority": 3,
                      "lines": [
                        {
                          "character": "Aaron",
                          "text": "Like a crossroad before us, we must choose the path of faithfulness.",
                          "emotion": "thoughtful"
                        },
                        {
                          "character": "Miriam",
                          "text": "The Lord's provision branches out in many directions, blessing all who follow Him.",
                          "emotion": "grateful"
                        }
                      ]
                    },
                    {
                      "id": "special-match-5-row",
                      "epoch": "any",
                      "triggerType": "specialMatch",
                      "matchType": "5-in-a-row",
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Like the five books of the Law, this alignment shows perfect order.",
                          "emotion": "approving"
                        },
                        {
                          "character": "Joshua",
                          "text": "A mighty work! The Lord brings all things into alignment according to His purpose.",
                          "emotion": "impressed"
                        }
                      ]
                    },
                  
                    /* POWER-UP CREATION DIALOGUES */
                    {
                      "id": "powerup-staff",
                      "epoch": "any",
                      "triggerType": "specialTileCreated",
                      "tileType": "staff",
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "The staff of God becomes a symbol of His power working through us!",
                          "emotion": "empowered",
                          "scriptureReference": "Exodus 4:20"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "With that staff, Moses parted the sea and brought water from the rock!",
                          "emotion": "reminiscing"
                        }
                      ]
                    },
                    {
                      "id": "powerup-pillar",
                      "epoch": "any",
                      "triggerType": "specialTileCreated",
                      "tileType": "pillar",
                      "priority": 5,
                      "lines": [
                        {
                          "character": "IsraeliteMother",
                          "text": "The pillar of fire guided us by night, and the pillar of cloud by day!",
                          "emotion": "awestruck",
                          "scriptureReference": "Exodus 13:21"
                        },
                        {
                          "character": "IsraeliteChild",
                          "text": "I feel safe when I see the Lord's pillar standing tall above our camp.",
                          "emotion": "secure"
                        }
                      ]
                    },
                    {
                      "id": "powerup-tablets",
                      "epoch": "any",
                      "triggerType": "specialTileCreated",
                      "tileType": "tablets",
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "The tablets of stone contain the words God Himself has written with His finger.",
                          "emotion": "reverent",
                          "scriptureReference": "Exodus 31:18"
                        },
                        {
                          "character": "Aaron",
                          "text": "These commands are not burdensome but are for our good, to guide and protect us.",
                          "emotion": "teaching",
                          "scriptureReference": "Deuteronomy 10:13"
                        }
                      ]
                    },
                  
                    /* CHAIN REACTION DIALOGUES */
                    {
                      "id": "chain-reaction-small",
                      "epoch": "any",
                      "triggerType": "chainReaction",
                      "chainLength": 3,
                      "priority": 3,
                      "lines": [
                        {
                          "character": "IsraeliteYouth",
                          "text": "One blessing leads to another, like a stream flowing down from the mountain!",
                          "emotion": "excited"
                        }
                      ]
                    },
                    {
                      "id": "chain-reaction-medium",
                      "epoch": "any",
                      "triggerType": "chainReaction",
                      "chainLength": 5,
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Miriam",
                          "text": "The Lord's blessings cascade like a waterfall, one after another!",
                          "emotion": "joyful"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "As one generation tells of God's works to another, so His blessings continue through the ages.",
                          "emotion": "thoughtful"
                        }
                      ]
                    },
                    {
                      "id": "chain-reaction-large",
                      "epoch": "any",
                      "triggerType": "chainReaction",
                      "chainLength": 7,
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "From Abraham to Isaac to Jacob to the twelve tribes — God's promises flow through the generations!",
                          "emotion": "inspired"
                        },
                        {
                          "character": "Aaron",
                          "text": "The Lord's faithfulness is like an endless river, flowing from one miracle to the next!",
                          "emotion": "worshipful"
                        }
                      ]
                    },
                  
                    /* HINT DIALOGUES */
                    {
                      "id": "hint-general",
                      "epoch": "any",
                      "triggerType": "hintRequested",
                      "priority": 3,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Look carefully at the patterns before you. The Lord gives wisdom to those who seek it.",
                          "emotion": "guiding",
                          "scriptureReference": "Proverbs 2:6"
                        },
                        {
                          "character": "Miriam",
                          "text": "Sometimes the path forward is not what first catches the eye. Seek with patience.",
                          "emotion": "encouraging"
                        }
                      ]
                    },
                    {
                      "id": "hint-special-tile",
                      "epoch": "any",
                      "triggerType": "hintRequested",
                      "contextType": "specialTileCreation",
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Aaron",
                          "text": "Five in a row could create something powerful. The Lord rewards those who align with His purpose.",
                          "emotion": "suggesting"
                        },
                        {
                          "character": "Joshua",
                          "text": "Special patterns yield special tools. Look for ways to align five tiles or create L and T shapes.",
                          "emotion": "strategic"
                        }
                      ]
                    },
                    {
                      "id": "hint-objective",
                      "epoch": "any",
                      "triggerType": "hintRequested",
                      "contextType": "objectiveReminder",
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Remember our goal. Focus on gathering what is needed to fulfill the Lord's instruction.",
                          "emotion": "refocusing"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "We must not lose sight of our purpose. The objective requires specific actions.",
                          "emotion": "reminding"
                        }
                      ]
                    },
                  
                    /* LEVEL FAILURE DIALOGUES */
                    {
                      "id": "failure-moves-exhausted",
                      "epoch": "any",
                      "triggerType": "levelFailed",
                      "failureReason": "movesExhausted",
                      "priority": 8,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "We must regroup and try again. The journey to the Promised Land is not without its setbacks.",
                          "emotion": "determined"
                        },
                        {
                          "character": "Aaron",
                          "text": "Our strength has been spent, but the Lord will renew us for another attempt.",
                          "emotion": "resilient"
                        }
                      ]
                    },
                    {
                      "id": "failure-objective-missed",
                      "epoch": "any",
                      "triggerType": "levelFailed",
                      "failureReason": "objectiveMissed",
                      "priority": 8,
                      "lines": [
                        {
                          "character": "Joshua",
                          "text": "We did not achieve what we set out to do. Let us learn from this and be more focused next time.",
                          "emotion": "reflective"
                        },
                        {
                          "character": "Miriam",
                          "text": "The Lord teaches us through both success and failure. We will try again with renewed insight.",
                          "emotion": "wise"
                        }
                      ]
                    },
                    {
                      "id": "failure-time-expired",
                      "epoch": "any",
                      "triggerType": "levelFailed",
                      "failureReason": "timeExpired",
                      "priority": 8,
                      "lines": [
                        {
                          "character": "IsraeliteYouth",
                          "text": "The time has passed too quickly! We must act with greater urgency when we try again.",
                          "emotion": "urgent"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "Time waits for no one. Let us be more swift in our actions when the Lord gives us another opportunity.",
                          "emotion": "instructing"
                        }
                      ]
                    },
                  
                    /* PAUSE MENU DIALOGUES */
                    {
                      "id": "pause-menu",
                      "epoch": "any",
                      "triggerType": "gamePaused",
                      "priority": 2,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Let us take a moment to rest and reflect on our journey thus far.",
                          "emotion": "calm"
                        },
                        {
                          "character": "Aaron",
                          "text": "Even in the wilderness, there were times of rest appointed by the Lord.",
                          "emotion": "peaceful",
                          "scriptureReference": "Exodus 16:30"
                        }
                      ]
                    },
                  
                    /* JOURNEY MAP DIALOGUES */
                    {
                      "id": "journey-map-intro",
                      "epoch": "any",
                      "triggerType": "journeyMapOpened",
                      "priority": 6,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Behold the path the Lord has set before us, from Egypt through the wilderness to the Promised Land.",
                          "emotion": "presenting"
                        },
                        {
                          "character": "Joshua",
                          "text": "Each location marks a significant event in our journey with God. Some were tests, others were victories.",
                          "emotion": "reflective"
                        }
                      ]
                    },
                    {
                      "id": "journey-map-exodus-selection",
                      "epoch": "exodus",
                      "triggerType": "epochSelected",
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "Here we see the beginning of our journey – the mighty deliverance from Egypt, the crossing of the Red Sea.",
                          "emotion": "reminiscing"
                        },
                        {
                          "character": "Miriam",
                          "text": "I remember taking my tambourine and leading the women in dance after we crossed the sea on dry ground!",
                          "emotion": "joyful",
                          "scriptureReference": "Exodus 15:20"
                        }
                      ]
                    },
                    {
                      "id": "journey-map-wilderness-selection",
                      "epoch": "wilderness",
                      "triggerType": "epochSelected",
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Aaron",
                          "text": "The wilderness years tested our faith, yet God provided manna every morning and water from the rock.",
                          "emotion": "thoughtful"
                        },
                        {
                          "character": "Caleb",
                          "text": "Forty years we wandered because of unbelief, but God was faithful even when we were not.",
                          "emotion": "sober",
                          "scriptureReference": "Numbers 14:33-34"
                        }
                      ]
                    },
                  
                    /* SCRIPTURE COLLECTION DIALOGUES */
                    {
                      "id": "scripture-collected",
                      "epoch": "any",
                      "triggerType": "scriptureCollected",
                      "priority": 7,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "These words from the Lord are more precious than gold. Keep them in your heart always.",
                          "emotion": "reverent",
                          "scriptureReference": "Deuteronomy 11:18"
                        },
                        {
                          "character": "IsraeliteScribe",
                          "text": "I have written down this scripture for our children and our children's children, that they may know the works of the Lord.",
                          "emotion": "dedicated"
                        }
                      ]
                    },
                    {
                      "id": "scripture-collection-milestone",
                      "epoch": "any",
                      "triggerType": "scriptureCollectionMilestone",
                      "progress": 0.5,
                      "priority": 6,
                      "lines": [
                        {
                          "character": "Joshua",
                          "text": "Your growing collection of scriptures shows your devotion to the Lord's words. They will guide your path.",
                          "emotion": "approving",
                          "scriptureReference": "Joshua 1:8"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "As our ancestors treasured the words given at Sinai, so should we treasure each scripture we learn.",
                          "emotion": "encouraging"
                        }
                      ]
                    },
                  
                    /* TUTORIAL DIALOGUES */
                    {
                      "id": "tutorial-basic-match",
                      "epoch": "exodus",
                      "triggerType": "tutorialStep",
                      "tutorialId": "basicMatching",
                      "priority": 9,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "To help our people, align three or more similar items in a row or column.",
                          "emotion": "instructing"
                        },
                        {
                          "character": "IsraeliteChild",
                          "text": "Like this? When I move these water drops together, they combine!",
                          "emotion": "learning"
                        }
                      ]
                    },
                    {
                      "id": "tutorial-special-matches",
                      "epoch": "exodus",
                      "triggerType": "tutorialStep",
                      "tutorialId": "specialMatches",
                      "priority": 9,
                      "lines": [
                        {
                          "character": "Aaron",
                          "text": "When you match four or five in a row, or create special patterns like L or T shapes, powerful tools appear.",
                          "emotion": "teaching"
                        },
                        {
                          "character": "IsraeliteYouth",
                          "text": "The staff of Moses! It can clear an entire row with its power!",
                          "emotion": "excited"
                        }
                      ]
                    },
                    {
                      "id": "tutorial-faith-meter",
                      "epoch": "exodus",
                      "triggerType": "tutorialStep",
                      "tutorialId": "faithMeter",
                      "priority": 9,
                      "lines": [
                        {
                          "character": "Miriam",
                          "text": "As you make matches, the faith meter fills. When full, you can call upon God's divine intervention.",
                          "emotion": "explaining"
                        },
                        {
                          "character": "Moses",
                          "text": "With a full faith meter, select it to activate powers like parting the Red Sea or calling down manna.",
                          "emotion": "demonstrating"
                        }
                      ]
                    },
                  
                    /* SCORE MILESTONE DIALOGUES */
                    {
                      "id": "score-milestone-small",
                      "epoch": "any",
                      "triggerType": "scoreMilestone",
                      "threshold": 1000,
                      "priority": 3,
                      "lines": [
                        {
                          "character": "IsraeliteYouth",
                          "text": "Our efforts are bearing fruit! The Lord blesses the work of our hands.",
                          "emotion": "pleased"
                        }
                      ]
                    },
                    {
                      "id": "score-milestone-medium",
                      "epoch": "any",
                      "triggerType": "scoreMilestone",
                      "threshold": 5000,
                      "priority": 4,
                      "lines": [
                        {
                          "character": "Aaron",
                          "text": "A significant achievement! Your diligence honors the Lord.",
                          "emotion": "approving"
                        },
                        {
                          "character": "IsraeliteElder",
                          "text": "We have accomplished much, but there is still more to be done.",
                          "emotion": "encouraging"
                        }
                      ]
                    },
                    {
                      "id": "score-milestone-large",
                      "epoch": "any",
                      "triggerType": "scoreMilestone",
                      "threshold": 10000,
                      "priority": 5,
                      "lines": [
                        {
                          "character": "Moses",
                          "text": "An extraordinary achievement! Truly the Lord has blessed our endeavors.",
                          "emotion": "impressed"
                        },
                        {
                          "character": "Miriam",
                          "text": "Let us praise the Lord for the success He has granted us! Great things He has done!",
                          "emotion": "celebrating"
                        }
                      ]
                    }
                ]