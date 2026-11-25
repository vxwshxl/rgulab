# 33. Write shell script for the following memory management methods, First Fit, Best Fit, and Worst fit.

#!/bin/bash

echo "Enter number of memory blocks:"
read nb
echo "Enter size of each block:"
for (( j = 0; j < nb; j++ ))
do
    read block[j]
done

echo "Enter number of processes:"
read np
echo "Enter size of each process:"
for (( i = 0; i < np; i++ ))
do
    read proc[i]
done

# $1 is the method name: First Fit, Best Fit or Worst Fit
allocate()
{
    # Every method starts again with all the blocks free
    for (( j = 0; j < nb; j++ ))
    do
        hole[j]=${block[j]}
    done

    echo
    echo "---------- $1 ----------"
    printf "%-10s%-8s%-8s%s\n" "Process" "Size" "Block" "Left"

    for (( i = 0; i < np; i++ ))
    do
        pick=-1
        for (( j = 0; j < nb; j++ ))
        do
            if (( hole[j] >= proc[i] ))
            then
                if (( pick == -1 ))
                then
                    pick=$j
                    # First Fit stops at the first block that is big enough
                    if [ "$1" = "First Fit" ]
                    then
                        break
                    fi
                elif [ "$1" = "Best Fit" ] && (( hole[j] < hole[pick] ))
                then
                    pick=$j    # smallest block that fits
                elif [ "$1" = "Worst Fit" ] && (( hole[j] > hole[pick] ))
                then
                    pick=$j    # largest block that fits
                fi
            fi
        done

        if (( pick == -1 ))
        then
            printf "%-10s%-8s%s\n" "P$((i + 1))" "${proc[i]}" "Not allocated"
        else
            hole[pick]=$((hole[pick] - proc[i]))
            printf "%-10s%-8s%-8s%s\n" "P$((i + 1))" "${proc[i]}" "B$((pick + 1))" "${hole[pick]}"
        fi
    done
}

allocate "First Fit"
allocate "Best Fit"
allocate "Worst Fit"

# ---------------- Output ----------------
# Enter number of memory blocks:
# 5
# Enter size of each block:
# 100
# 500
# 200
# 300
# 600
# Enter number of processes:
# 4
# Enter size of each process:
# 212
# 417
# 112
# 426
#
# ---------- First Fit ----------
# Process   Size    Block   Left
# P1        212     B2      288
# P2        417     B5      183
# P3        112     B2      176
# P4        426     Not allocated
#
# ---------- Best Fit ----------
# Process   Size    Block   Left
# P1        212     B4      88
# P2        417     B2      83
# P3        112     B3      88
# P4        426     B5      174
#
# ---------- Worst Fit ----------
# Process   Size    Block   Left
# P1        212     B5      388
# P2        417     B2      83
# P3        112     B5      276
# P4        426     Not allocated
