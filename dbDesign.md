Bilkul. Is schema ko **database ke perspective se visual** samjho. Sabse pehle ek important baat:

 > `User → Routine → WorkoutSession → Progress` user ki fitness journey hai,\
>  jabki `Muscle → Exercise` master/library data hai.

 ## 1\. Overall relationship

```
                         ┌──────────────────┐
                         │      USER        │
                         │──────────────────│
                         │ id               │
                         │ email            │
                         │ passwordHash     │
                         │ role             │
                         └────────┬─────────┘
                                  │
                    1 ────────────┼──────────── 1
                                  │
                         ┌────────▼─────────┐
                         │   USER PROFILE   │
                         │──────────────────│
                         │ age              │
                         │ gender           │
                         │ heightCm         │
                         │ weightKg         │
                         │ fitnessLevel     │
                         └──────────────────┘

                                  USER
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
              │ 1:N                │ 1:N                 │ 1:N
              ▼                    ▼                     ▼
        ┌───────────┐       ┌───────────────┐     ┌───────────────┐
        │  ROUTINE  │       │WORKOUT SESSION│     │PROGRESS RECORD│
        └─────┬─────┘       └───────┬───────┘     └───────────────┘
              │                     │
              │ 1:N                 │ 1:N
              ▼                     ▼
        ┌───────────┐        ┌──────────────┐
        │ ROUTINE   │        │ WORKOUT SET  │
        │    DAY    │        └──────┬───────┘
        └─────┬─────┘               │
              │                     │ N:1
              │ 1:N                 │
              ▼                     ▼
        ┌───────────────┐     ┌───────────┐
        │   ROUTINE     │────►│ EXERCISE  │
        │   EXERCISE    │     └─────┬─────┘
        └───────────────┘           │
                                    │ N:M
                                    ▼
                              ┌────────────┐
                              │   MUSCLE   │
                              └────────────┘
```

 Ab ek-ek relationship samajhte hain.

---

 # 2\. `User` → `UserProfile`

 Ye **1-to-1** relationship hai.

```
USER
 │
 │ 1 : 1
 ▼
USER PROFILE
```

 Example:

```
User
────────────────
id: u123
email: rahul@gmail.com
firstName: Rahul
role: USER

        │
        ▼

UserProfile
────────────────
userId: u123
age: 24
heightCm: 175
weightKg: 72
fitnessLevel: BEGINNER
```

 ### Matlab:

 Ek user ka **ek profile**.

 Aur ek profile sirf **ek user** ki hogi.

 Database mein:

```
userId String @unique
```

 `@unique` ki wajah se ek `userId` multiple profiles nahi bana sakta.

---

 # 3\. `User` → `Routine`

 Ye **1-to-many** hai.

```
             USER
              │
        ┌─────┼─────┐
        │     │     │
        ▼     ▼     ▼
    Routine  Routine  Routine
```

 Example:

```
Rahul
 │
 ├── Muscle Gain Routine
 │
 ├── Fat Loss Routine
 │
 └── Home Workout Routine
```

 Database:

```
User
id = U1

Routine
id = R1
userId = U1
name = Muscle Gain

Routine
id = R2
userId = U1
name = Fat Loss
```

 Isliye `Routine` mein:

```
userId String
```

 hai.

---

 # 4\. `Routine` → `RoutineDay`

 Ek routine ke andar multiple days honge.

```
ROUTINE
   │
   ├── Monday
   ├── Tuesday
   ├── Wednesday
   ├── Thursday
   ├── Friday
   ├── Saturday
   └── Sunday
```

 Database relationship:

```
Routine
   │
   │ 1:N
   ▼
RoutineDay
```

 Example:

```
Muscle Gain Routine
        │
        ├── Monday
        ├── Tuesday
        ├── Wednesday
        ├── Thursday
        ├── Friday
        ├── Saturday
        └── Sunday
```

 `RoutineDay`:

```
routineId
dayOfWeek
isRestDay
```

 For example:

```
routineId = R1
dayOfWeek = 1
isRestDay = false
```

 could mean Monday workout.

---

 # 5\. `RoutineDay` → `RoutineExercise`

 Ab actual workout exercises aayenge.

```
Monday
  │
  ├── Bench Press
  ├── Incline Dumbbell Press
  ├── Cable Fly
  └── Push Ups
```

 Relationship:

```
RoutineDay
     │
     │ 1:N
     ▼
RoutineExercise
```

 Example:

```
Monday
 │
 ├── Bench Press
 │     4 sets
 │     8-12 reps
 │
 ├── Incline DB Press
 │     3 sets
 │     10-12 reps
 │
 └── Cable Fly
       3 sets
       12-15 reps
```

 Important:

 `RoutineExercise` actual **exercise master data nahi hai**.

 Ye batata hai:

 > "Is particular user's routine mein ye exercise kaise perform hogi?"

 Isliye:

```
RoutineExercise
────────────────────
exerciseId
routineDayId
order
sets
reps
restSeconds
```

---

 # 6\. `Exercise` aur `Muscle`

 Ye schema ka sabse important relationship hai.

 Ek exercise multiple muscles ko target kar sakti hai.

 Aur ek muscle ke multiple exercises ho sakte hain.

 So:

```
Exercise ←──── N:M ────→ Muscle
```

 Direct relation nahi banayenge.

 Beech mein junction table:

```
ExerciseMuscle
```

 banayi hai.

 Visual:

```
                 EXERCISE
                    │
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
       Chest     Triceps   Front Delt
          ▲         ▲         ▲
          │         │         │
          └─────────┼─────────┘
                    │
              ExerciseMuscle
```

 Actual structure:

```
Exercise
   │
   │
   ▼
ExerciseMuscle
   │
   │
   ▼
Muscle
```

 Example:

```
Bench Press
     │
     ├── Chest       PRIMARY
     ├── Triceps     SECONDARY
     └── Shoulders   SECONDARY
```

 Database:

```
ExerciseMuscle
────────────────────────────
exerciseId | muscleId | role
────────────────────────────
bench      | chest    | PRIMARY
bench      | triceps  | SECONDARY
bench      | shoulders| SECONDARY
```

 Isi liye humne:

```
enum MuscleRole {
  PRIMARY
  SECONDARY
}
```

 banaya hai.

---

 # 7\. Ek Exercise ka complete flow

 Ab ek real example dekho.

```
                 ┌────────────────────┐
                 │      EXERCISE      │
                 │────────────────────│
                 │ Bench Press        │
                 │ Intermediate       │
                 │ BARBELL            │
                 └─────────┬──────────┘
                           │
                    ExerciseMuscle
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        ┌─────────┐   ┌─────────┐   ┌───────────┐
        │ CHEST   │   │ TRICEPS │   │ SHOULDERS │
        │ PRIMARY │   │SECONDARY│   │ SECONDARY │
        └─────────┘   └─────────┘   └───────────┘
```

---

 # 8\. User routine ka complete flow

 Ab maan lo Rahul ne routine banaya:

```
USER
Rahul
 │
 ▼
ROUTINE
Muscle Gain
 │
 ├────────────────────────────────────┐
 │                                    │
 ▼                                    ▼
MONDAY                              TUESDAY
 │                                    │
 ▼                                    ▼
RoutineDay                         RoutineDay
 │                                    │
 ├── Bench Press                      ├── Pull Ups
 ├── Incline DB Press                 ├── Barbell Row
 └── Cable Fly                        └── Lat Pulldown
```

 Aur har `RoutineExercise` actual `Exercise` table se connect hota hai:

```
RoutineExercise
      │
      │ exerciseId
      ▼
   Exercise
```

---

 # 9\. `WorkoutSession` ka role

 Ye thoda important distinction hai.

 ### Routine

 Routine batata hai:

 > **Aaj kya karna hai?**

 ### WorkoutSession

 WorkoutSession batata hai:

 > **Aaj actually kya kiya?**

 Example:

```
ROUTINE
Monday
──────────────
Bench Press
4 × 8-12
```

 User gym gaya.

 Actual performance:

```
WORKOUT SESSION
Monday
──────────────
Bench Press

Set 1 → 60kg × 12 ✓
Set 2 → 60kg × 10 ✓
Set 3 → 65kg × 8  ✓
Set 4 → 65kg × 7  ✓
```

 Relationship:

```
USER
 │
 │ 1:N
 ▼
WORKOUT SESSION
 │
 │ 1:N
 ▼
WORKOUT SET
 │
 │ N:1
 ▼
EXERCISE
```

---

 # 10\. Workout Session visual

```
                    USER
                     │
                     │
                     ▼
              WORKOUT SESSION
              ────────────────
              id: WS001
              startedAt: ...
              completedAt: ...
                     │
                     │
              ┌──────┼──────┐
              ▼      ▼      ▼
           SET 1   SET 2   SET 3
           60×12   60×10   65×8
              │      │      │
              └──────┼──────┘
                     │
                     ▼
                  EXERCISE
                Bench Press
```

---

 # 11\. `ProgressRecord`

 Ye workout session se alag hai.

 Workout:

```
Aaj kitna weight/reps kiya?
```

 Progress:

```
Time ke saath body mein kya change hua?
```

 Example:

```
USER
 │
 ├── ProgressRecord
 │      ├── Jan 1 → 78kg
 │      ├── Feb 1 → 76kg
 │      ├── Mar 1 → 74kg
 │      └── Apr 1 → 73kg
 │
 └── WorkoutSession
        ├── Jan 1
        ├── Jan 3
        ├── Jan 5
        └── ...
```

 ProgressRecord mein:

```
weightKg
bodyFat
chestCm
waistCm
armsCm
thighCm
shouldersCm
```

 store ho sakte hain.

---

 # 12\. Sab relationships ek jagah

 Isko save kar lo—ye tumhare backend ka mental model hai:

```
                           ┌──────────────┐
                           │     USER     │
                           └──────┬───────┘
                                  │
                 ┌────────────────┼─────────────────┐
                 │                │                 │
                1:1              1:N               1:N
                 │                │                 │
                 ▼                ▼                 ▼
          ┌────────────┐    ┌──────────┐     ┌──────────────┐
          │USER PROFILE│    │ ROUTINE  │     │WORKOUT SESSION│
          └────────────┘    └────┬─────┘     └──────┬───────┘
                                 │                  │
                                1:N                1:N
                                 │                  │
                                 ▼                  ▼
                           ┌────────────┐    ┌─────────────┐
                           │ ROUTINE DAY│    │ WORKOUT SET │
                           └─────┬──────┘    └──────┬──────┘
                                 │                  │
                                1:N                N:1
                                 │                  │
                                 ▼                  ▼
                         ┌────────────────┐    ┌──────────┐
                         │ROUTINE EXERCISE│───►│ EXERCISE │
                         └────────────────┘    └────┬─────┘
                                                    │
                                                   N:M
                                                    │
                                                    ▼
                                             ┌─────────────┐
                                             │EXERCISE     │
                                             │MUSCLE       │
                                             └──────┬──────┘
                                                    │
                                                    ▼
                                              ┌──────────┐
                                              │  MUSCLE  │
                                              └──────────┘

                           USER
                            │
                           1:N
                            │
                            ▼
                    ┌────────────────┐
                    │PROGRESS RECORD │
                    └────────────────┘
```

 Actually `ExerciseMuscle` ko beech mein aise samajhna best hai:

```
EXERCISE                     MUSCLE
   │                            │
   │ 1:N                        │ 1:N
   ▼                            ▼
      ┌─────────────────────┐
      │   EXERCISE MUSCLE   │
      │─────────────────────│
      │ exerciseId          │
      │ muscleId            │
      │ role                │
      └─────────────────────┘
```

 Therefore:

```
Exercise ↔ Muscle = Many-to-Many
```

---

 ## 13\. Ek user ki complete journey

 Ab sab kuch combine karo:

```
                         RAHUL
                           │
             ┌─────────────┼──────────────┐
             │             │              │
             ▼             ▼              ▼
          PROFILE       ROUTINE       PROGRESS
             │             │              │
          24 yrs           │           72 kg
          175 cm            │           71 kg
          72 kg             ▼           70 kg
                       ROUTINE DAY
                           │
                           ▼
                    ROUTINE EXERCISE
                           │
                           ▼
                       EXERCISE
                           │
                 ┌─────────┼─────────┐
                 ▼         ▼         ▼
               CHEST    TRICEPS   SHOULDERS

                     When workout happens
                              │
                              ▼
                       WORKOUT SESSION
                              │
                              ▼
                        WORKOUT SET
                              │
                              ▼
                           EXERCISE
```

 ### Simple language mein:

 - **User** = kaun workout kar raha hai
- **UserProfile** = us user ki body/basic information
- **Muscle** = body parts
- **Exercise** = exercise library
- **ExerciseMuscle** = exercise kaunse muscle ko target karti hai
- **Routine** = user ka saved weekly program
- **RoutineDay** = routine ka Monday/Tuesday/etc.
- **RoutineExercise** = us din ka exercise + sets/reps/rest
- **WorkoutSession** = actual gym session
- **WorkoutSet** = actual performed set, jaise `65kg × 8`
- **ProgressRecord** = body/progress history

 **Sabse important distinction:** `RoutineExercise` aur `WorkoutSet` ko confuse mat karna. `RoutineExercise` **planned workout** hai, jabki `WorkoutSet` **actual performed workout** hai. Isi separation ki wajah se hum baad mein planned-vs-actual progress, progressive overload aur workout history properly bana paayenge.