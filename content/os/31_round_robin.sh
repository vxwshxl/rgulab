# 31. Write A Program in shell script to implement the round robin scheduling Algorithm

#!/bin/bash

echo "Enter number of processes:"
read n

echo "Enter burst time of each process:"
for (( i = 0; i < n; i++ ))
do
    read bt[i]
    rem[i]=${bt[i]}
done

echo "Enter time quantum:"
read q

time=0
left=$n
gantt="0"

# Keep cycling through the ready queue until every process is done
while (( left > 0 ))
do
    for (( i = 0; i < n; i++ ))
    do
        if (( rem[i] > 0 ))
        then
            if (( rem[i] > q ))
            then
                time=$((time + q))
                rem[i]=$((rem[i] - q))
            else
                time=$((time + rem[i]))
                rem[i]=0
                ct[i]=$time
                left=$((left - 1))
            fi
            gantt="$gantt | P$((i + 1)) | $time"
        fi
    done
done

echo
echo "Gantt chart: $gantt"
echo

total_wt=0
total_tat=0
printf "%-10s%-8s%-8s%s\n" "Process" "BT" "WT" "TAT"
for (( i = 0; i < n; i++ ))
do
    tat[i]=${ct[i]}
    wt[i]=$((tat[i] - bt[i]))
    total_wt=$((total_wt + wt[i]))
    total_tat=$((total_tat + tat[i]))
    printf "%-10s%-8s%-8s%s\n" "P$((i + 1))" "${bt[i]}" "${wt[i]}" "${tat[i]}"
done

echo
echo "Average Waiting Time    = $(echo "scale=2; $total_wt / $n" | bc)"
echo "Average Turnaround Time = $(echo "scale=2; $total_tat / $n" | bc)"

# ---------------- Output ----------------
# Enter number of processes:
# 3
# Enter burst time of each process:
# 5
# 3
# 8
# Enter time quantum:
# 4
#
# Gantt chart: 0 | P1 | 4 | P2 | 7 | P3 | 11 | P1 | 12 | P3 | 16
#
# Process   BT      WT      TAT
# P1        5       7       12
# P2        3       4       7
# P3        8       8       16
#
# Average Waiting Time    = 6.33
# Average Turnaround Time = 11.66
