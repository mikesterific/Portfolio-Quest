# MEMORY BANK BUILD MODE

Your role is to build the planned changes following the implementation plan and creative phase decisions.

```mermaid
graph TD
    Start["🚀 START BUILD MODE"] --> ReadDocs["📚 Read Reference Documents"]
    
    %% Initialization
    ReadDocs --> CheckLevel{"🧩 Determine<br>Complexity Level"}
    
    %% Level 1 Implementation
    CheckLevel -->|"Level 1<br>Quick Bug Fix"| L1Process["🔧 LEVEL 1 PROCESS"]
    L1Process --> L1Review["🔍 Review Bug Report"]
    L1Review --> L1Examine["👁️ Examine Code"]
    L1Examine --> L1Fix["⚒️ Implement Fix"]
    L1Fix --> L1Test["✅ Test Fix"]
    L1Test --> L1Update["📝 Update tasks.md"]
    
    %% Level 2 Implementation
    CheckLevel -->|"Level 2<br>Simple Enhancement"| L2Process["🔨 LEVEL 2 PROCESS"]
    L2Process --> L2Review["🔍 Review Plan"]
    L2Review --> L2Examine["👁️ Examine Code"]
    L2Examine --> L2Implement["⚒️ Implement Changes"]
    L2Implement --> L2Test["✅ Test Changes"]
    L2Test --> L2Update["📝 Update tasks.md"]
    
    %% Level 3-4 Implementation
    CheckLevel -->|"Level 3-4<br>Feature/System"| L34Process["🏗️ LEVEL 3-4 PROCESS"]
    L34Process --> L34Review["🔍 Review Plan & Creative"]
    L34Review --> L34Phase["📋 Phased Implementation"]
    L34Phase --> L34Test["✅ Test Each Phase"]
    L34Test --> L34Integration["🔄 Integration Testing"]
    L34Integration --> L34Update["📝 Update tasks.md"]
    
    %% Completion
    L1Update & L2Update & L34Update --> VerifyComplete["✅ Verify Complete"]
    VerifyComplete --> Transition["⏭️ NEXT MODE:<br>REFLECT MODE"]
```

## BUILD APPROACH

### Level 1: Quick Bug Fix
1. Review the issue carefully
2. Locate specific code causing the issue
3. Implement focused fix
4. Test thoroughly to verify resolution
5. Document the solution

### Level 2: Enhancement Build
1. Follow build plan
2. Build each component
3. Test each component
4. Verify integration
5. Document build details

### Level 3-4: Phased Build
1. Review creative phase decisions
2. Build in planned phases
3. Test each phase
4. Comprehensive integration testing
5. Detailed documentation

## VERIFICATION CHECKLIST
- All build steps completed?
- Changes thoroughly tested?
- Build meets requirements?
- Build details documented?
- tasks.md updated with status?
