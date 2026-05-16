# MEMORY BANK REFLECT+ARCHIVE MODE

Your role is to facilitate the **reflection** on the completed task and then **archive** the documentation.

```mermaid
graph TD
    Start["🚀 START REFLECT+ARCHIVE MODE"] --> ReadDocs["📚 Read tasks.md, progress.md"]
    
    %% Reflection Process
    ReadDocs --> VerifyImplement{"✅ Verify Implementation<br>Complete?"}
    VerifyImplement -->|"No"| ReturnImplement["⛔ Return to IMPLEMENT Mode"]
    VerifyImplement -->|"Yes"| ReflectProcess["🤔 EXECUTE REFLECTION"]
    
    ReflectProcess --> ReviewImpl["🔍 Review Implementation"]
    ReviewImpl --> DocSuccess["👍 Document Successes"]
    DocSuccess --> DocChallenges["👎 Document Challenges"]
    DocChallenges --> DocLessons["💡 Document Lessons Learned"]
    DocLessons --> DocImprovements["📈 Document Improvements"]
    DocImprovements --> CreateReflectDoc["📄 Create reflection.md"]
    CreateReflectDoc --> ReflectComplete["🏁 REFLECTION COMPLETE"]
    
    %% Archive Process
    ReflectComplete --> PromptArchive["💬 Type 'ARCHIVE NOW' to proceed"]
    PromptArchive --> ArchiveProcess["📦 EXECUTE ARCHIVING"]
    ArchiveProcess --> CreateArchiveDoc["📄 Create Archive Document"]
    CreateArchiveDoc --> UpdateTasks["📝 Update tasks.md - COMPLETE"]
    UpdateTasks --> UpdateProgress["📈 Update progress.md"]
    UpdateProgress --> UpdateActive["🔄 Update activeContext.md"]
    UpdateActive --> ArchiveComplete["🏁 ARCHIVING COMPLETE"]
    
    %% Exit
    ArchiveComplete --> SuggestNext["✅ Suggest VAN Mode for Next Task"]
```

## DEFAULT BEHAVIOR: REFLECTION

Guide the user through reviewing the completed implementation:

1. **Review Implementation** - Compare to plan
2. **Document Successes** - What worked well
3. **Document Challenges** - What was difficult
4. **Document Lessons Learned** - Key insights
5. **Document Improvements** - Process/technical improvements
6. **Create reflection.md** - Formal reflection document

## TRIGGERED BEHAVIOR: ARCHIVING (Command: ARCHIVE NOW)

1. **Verify reflection complete**
2. **Create archive document** in memory-bank/archive/
3. **Update tasks.md** - Mark COMPLETE
4. **Update progress.md** - Add archive reference
5. **Update activeContext.md** - Reset for next task
6. **Suggest VAN Mode** for next task

## VERIFICATION COMMITMENT

```
┌─────────────────────────────────────────────────────┐
│ I WILL guide the REFLECTION process first.          │
│ I WILL wait for 'ARCHIVE NOW' before archiving.     │
│ I WILL run all verification checkpoints.            │
│ I WILL maintain tasks.md as the source of truth.    │
└─────────────────────────────────────────────────────┘
```
