# 32. Write shell script for Bankers Algorithm.

#!/bin/bash

echo "Enter number of processes:"
read n
echo "Enter number of resource types:"
read m

# 2D matrices are stored in 1D arrays: row i, column j is at index i * m + j
echo "Enter Allocation matrix (one row per process):"
for (( i = 0; i < n; i++ ))
do
    read line
    j=0
    for x in $line
    do
        alloc[i * m + j]=$x
        j=$((j + 1))
    done
done

echo "Enter Max matrix (one row per process):"
for (( i = 0; i < n; i++ ))
do
    read line
    j=0
    for x in $line
    do
        max[i * m + j]=$x
        j=$((j + 1))
    done
done

echo "Enter Available resources:"
read line
j=0
for x in $line
do
    work[j]=$x
    j=$((j + 1))
done

# Need = Max - Allocation
echo
echo "Need matrix:"
for (( i = 0; i < n; i++ ))
do
    row=""
    for (( j = 0; j < m; j++ ))
    do
        need[i * m + j]=$((max[i * m + j] - alloc[i * m + j]))
        row="$row ${need[i * m + j]}"
    done
    echo "P$i:$row"
    finish[i]=0
done

# Safety algorithm
seq=""
count=0
found=1
while (( count < n && found == 1 ))
do
    found=0
    for (( i = 0; i < n; i++ ))
    do
        if (( finish[i] == 0 ))
        then
            ok=1
            for (( j = 0; j < m; j++ ))
            do
                if (( need[i * m + j] > work[j] ))
                then
                    ok=0
                fi
            done

            if (( ok == 1 ))
            then
                # Process i can finish, so it gives back what it holds
                for (( j = 0; j < m; j++ ))
                do
                    work[j]=$((work[j] + alloc[i * m + j]))
                done
                finish[i]=1
                seq="$seq P$i"
                count=$((count + 1))
                found=1
            fi
        fi
    done
done

echo
if (( count == n ))
then
    echo "The system is in a SAFE state."
    echo "Safe sequence:$seq"
else
    echo "The system is in an UNSAFE state (deadlock possible)."
fi

# ---------------- Output ----------------
# Enter number of processes:
# 5
# Enter number of resource types:
# 3
# Enter Allocation matrix (one row per process):
# 0 1 0
# 2 0 0
# 3 0 2
# 2 1 1
# 0 0 2
# Enter Max matrix (one row per process):
# 7 5 3
# 3 2 2
# 9 0 2
# 2 2 2
# 4 3 3
# Enter Available resources:
# 3 3 2
#
# Need matrix:
# P0: 7 4 3
# P1: 1 2 2
# P2: 6 0 0
# P3: 0 1 1
# P4: 4 3 1
#
# The system is in a SAFE state.
# Safe sequence: P1 P3 P4 P0 P2
